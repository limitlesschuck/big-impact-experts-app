const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-sonnet-4-6";

export interface GeneratedEpisodeContent {
  youtubeTitles: string[];
  youtubeDescription: string;
  podcastTitle: string;
  websiteDescription: string;
  tags: string[];
  suggestedCategory: string;
}

export interface GeneratedGuideContent {
  bio: string;
  frameworks: string;
  takeaways: string;
  quotes: string;
  actionItems: string;
}

const GUIDE_GENERATION_TIMEOUT_MS = 150_000;

// Claude sometimes returns a field as a real JSON array (e.g. when the
// prompt says "format as a simple list") instead of the formatted string
// the schema expects -- `JSON.parse(...) as GeneratedGuideContent` doesn't
// catch that at runtime, so every field is coerced through here before use.
function toGuideFieldString(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(String).join("\n");
  return value == null ? "" : String(value);
}

export async function generateGuideContent(params: {
  panelistName: string;
  panelistBio: string | null;
  transcriptSegments: { label: string; text: string }[];
}): Promise<GeneratedGuideContent> {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("CLAUDE_API_KEY not set");

  const validSegments = params.transcriptSegments.filter((s) => s.text.trim());
  const contentSource =
    validSegments.length > 0
      ? validSegments.map((s) => `--- ${s.label} ---\n${s.text.slice(0, 10000)}`).join("\n\n")
      : `BIO:\n${params.panelistBio ?? "Not provided"}`;
  const multiSegmentNote =
    validSegments.length > 1
      ? "\n\nNote: this source material spans multiple separate appearances by this panelist -- synthesize the best material across all of them into ONE cohesive guide; don't repeat a framework, takeaway, or quote that shows up in more than one segment."
      : "";

  const prompt = `You are an expert content creator for a monthly expert panel event. Your job is to extract and structure the most valuable content from a panelist's transcript segment into a downloadable guide for members.

Panelist: ${params.panelistName}

${contentSource}${multiSegmentNote}

Generate a structured guide and return ONLY valid JSON with no markdown, no code fences, no preamble. Note: the source material above may be long -- that does not mean every field should be long. Follow each field's length limit exactly regardless of how much source content is available.

{
  "bio": "A SHORT bio of the panelist covering who they are, their background, credentials, and what makes them uniquely qualified to speak on this topic. Write in third person. HARD LIMIT: 120 words maximum, no exceptions. Extract only the 2-3 most compelling, credibility-establishing facts -- do not attempt to summarize everything available in the source material.",
  "frameworks": "The 2-4 most important frameworks, systems, or methodologies shared in this segment. For each one: give it a name, describe what it is in 2-3 sentences, explain how to apply it in 3-5 bullet points. Format as clear sections separated by double newlines.",
  "takeaways": "The 5-7 most powerful insights or lessons from this segment. Each takeaway should be 2-3 sentences that capture the idea and why it matters. Format as a numbered list.",
  "quotes": "The 5-8 most memorable, quotable, and actionable direct quotes from the panelist. Include only quotes that stand alone and deliver value without context. Format as a simple list with each quote on its own line starting with a quotation mark.",
  "actionItems": "A practical checklist of 8-12 action items members can implement immediately based on this segment. Each item should be specific and actionable, starting with a verb. Format as a simple list."
}`;

  let res: Response;
  try {
    res = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 3000,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(GUIDE_GENERATION_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error("Claude took too long to respond — please try again");
    }
    throw error;
  }

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Claude API error generating guide: ${res.status} — ${error}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text ?? "";

  let parsed: Record<string, unknown>;
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Failed to parse guide response: ${text.slice(0, 200)}`);
  }

  return {
    bio: toGuideFieldString(parsed.bio),
    frameworks: toGuideFieldString(parsed.frameworks),
    takeaways: toGuideFieldString(parsed.takeaways),
    quotes: toGuideFieldString(parsed.quotes),
    actionItems: toGuideFieldString(parsed.actionItems),
  };
}

// Truncates at a hard character limit without cutting a word in half --
// models don't always hit the limit exactly despite instructions, so this
// is the enforcement backstop, not the primary mechanism.
function truncateAtWord(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim();
}

export async function shortenPanelistBio(params: {
  panelistName: string;
  panelistBio: string;
  maxLength: number;
}): Promise<string> {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("CLAUDE_API_KEY not set");

  const prompt = `You are writing a one-line bio for an expert speaker's card on an event registration page. Attendees will read this in about 3 seconds while deciding whether to register, so it must be sharp and specific -- not a generic career summary.

Speaker: ${params.panelistName}

FULL BIO:
${params.panelistBio}

Write a condensed version of this bio for the registration page, following these rules:
- Focus specifically on the ONE primary thing this person can help attendees with -- their core expertise, specialty, or the outcome they're known for delivering. Do not attempt to summarize their whole career or list multiple accomplishments.
- Write in third person, present tense.
- HARD LIMIT: ${params.maxLength} characters maximum, including spaces. Do not exceed this under any circumstances.
- No quotation marks, no markdown, no preamble, no explanation -- output ONLY the finished bio text and nothing else.`;

  const res = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: Math.max(150, Math.ceil(params.maxLength / 3)),
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Claude API error shortening bio: ${res.status} — ${error}`);
  }

  const data = await res.json();
  const text = (data.content?.[0]?.text ?? "").trim();
  return truncateAtWord(text, params.maxLength);
}

export async function generateEpisodeContent(params: {
  titleOriginal: string;
  descriptionOriginal: string;
  transcript: string | null;
  riversideTitle: string | null;
  riversideKeywords: string | null;
  guestName: string | null;
  crisisCategory: string | null;
}): Promise<GeneratedEpisodeContent> {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("CLAUDE_API_KEY not set");

  const { getCategoryValuesList } = await import("@/lib/categories");
  const categoryValues = await getCategoryValuesList();

  const categoryHint = params.crisisCategory
    ? `The episode has been categorised as: ${params.crisisCategory}.`
    : `Please suggest the most appropriate crisis category from: ${categoryValues.join(", ")}.`;

  const contentSource = params.transcript
    ? `TRANSCRIPT (use this as the primary source):\n${params.transcript.slice(0, 8000)}`
    : `SHOW NOTES:\n${params.descriptionOriginal}`;

  const prompt = `You are an expert podcast content strategist specialising in personal transformation content. Your job is to rewrite podcast episode metadata to maximise YouTube discovery and emotional resonance for people going through a personal crisis or life transition.

Here is the episode information:
Working title: ${params.riversideTitle ?? params.titleOriginal}
Guest: ${params.guestName ?? "Not specified"}
Keywords: ${params.riversideKeywords ?? "Not specified"}
${contentSource}
${categoryHint}

Generate the following and return ONLY valid JSON with no markdown, no code fences, no preamble:

{
  "youtubeTitles": [
    "Title option 1 — lead with the pain/crisis state, include specific detail, under 70 chars",
    "Title option 2 — different angle on the same story",
    "Title option 3 — most search-optimised version"
  ],
  "youtubeDescription": "Full YouTube description (300-400 words). First 2 lines must hook the viewer before the fold. Include timestamps if available from the original. End with a CTA to take the free assessment. Use line breaks for readability.",
  "podcastTitle": "Rewritten podcast title optimised for Apple and Spotify search — under 60 chars, lead with topic not guest name",
  "websiteDescription": "SEO-optimised episode page description (150-200 words). Include the primary search keyword naturally. Write for someone searching for help with this specific crisis.",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8"],
  "suggestedCategory": "one of: ${categoryValues.join(", ")}"
}`;

  const res = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    if (res.status === 529 || res.status === 402) {
      throw new Error(
        "Anthropic API credit limit reached — please add credits at console.anthropic.com"
      );
    }
    if (res.status === 401) {
      throw new Error(
        "Anthropic API key is invalid — check CLAUDE_API_KEY in Replit Secrets"
      );
    }
    const error = await res.text();
    throw new Error(`Claude API error: ${res.status} — ${error}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text ?? "";

  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned) as GeneratedEpisodeContent;
  } catch {
    throw new Error(`Failed to parse Claude response: ${text}`);
  }
}

// ── Expert Match (Member Dashboard) ─────────────────────────────────
// Shared low-level helper, used only by the two functions below --
// the three functions above already have their own working fetch+parse
// logic and are left as-is rather than retrofitted onto this, to avoid
// touching stable, unrelated code paths for this change.
async function callClaudeForText(params: {
  prompt: string;
  maxTokens: number;
  timeoutMs: number;
  timeoutMessage: string;
}): Promise<string> {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("CLAUDE_API_KEY not set");

  let res: Response;
  try {
    res = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: params.maxTokens,
        messages: [{ role: "user", content: params.prompt }],
      }),
      signal: AbortSignal.timeout(params.timeoutMs),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error(params.timeoutMessage);
    }
    throw error;
  }

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Claude API error: ${res.status} — ${error}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

function parseClaudeJson<T>(text: string): T {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(`Failed to parse Claude response: ${text.slice(0, 200)}`);
  }
}

const EXPERT_MATCH_NARROW_TIMEOUT_MS = 15_000;
const EXPERT_MATCH_ANSWER_TIMEOUT_MS = 25_000;
export const MAX_NARROWED_CANDIDATES = 5;

export interface ExpertMatchCandidateSummary {
  index: number;
  name: string;
  title: string;
  blurb: string;
}

export interface ExpertMatchCandidateProfile {
  index: number;
  name: string;
  title: string;
  guideBio: string;
  guideFrameworks: string;
  guideTakeaways: string;
  guideQuotes: string;
  guideActionItems: string;
}

export interface ExpertMatchAnswer {
  matched: boolean;
  message: string;
  recommendations: { candidateIndex: number; summary: string }[];
}

// Step 1: cheap, fast narrowing using only short summaries (not full
// guide content) for every candidate -- a Claude call rather than plain
// keyword matching, since a member's question often won't lexically
// overlap with guide content even when it's topically relevant.
export async function narrowExpertCandidates(
  question: string,
  candidates: ExpertMatchCandidateSummary[]
): Promise<number[]> {
  if (candidates.length === 0) return [];

  const roster = candidates
    .map((c) => `${c.index}. ${c.name}${c.title ? ` — ${c.title}` : ""}: ${c.blurb}`)
    .join("\n");

  const prompt = `You are narrowing a roster of experts down to the ones plausibly relevant to a member's question, based only on the short summaries below -- you have not seen their full content yet, so only judge plausible topical relevance here.

Member's question: "${question}"

Roster:
${roster}

Return ONLY valid JSON, no markdown, no preamble:
{
  "candidateIndexes": [array of up to ${MAX_NARROWED_CANDIDATES} numbers from the roster above, most plausibly relevant first -- empty array if none plausibly relate to the question]
}`;

  const text = await callClaudeForText({
    prompt,
    maxTokens: 300,
    timeoutMs: EXPERT_MATCH_NARROW_TIMEOUT_MS,
    timeoutMessage: "Expert matching took too long to narrow candidates — please try again",
  });

  const parsed = parseClaudeJson<{ candidateIndexes?: unknown }>(text);
  const validIndexes = new Set(candidates.map((c) => c.index));
  const indexes = Array.isArray(parsed.candidateIndexes) ? parsed.candidateIndexes : [];
  return indexes
    .filter((i): i is number => typeof i === "number" && validIndexes.has(i))
    .slice(0, MAX_NARROWED_CANDIDATES);
}

// Step 2: the real, grounded answer -- only ever given the full guide
// content of the shortlisted candidates from step 1, never the whole
// roster. Claude only ever refers to a candidate by its numeric index
// into the list it was just given here; it's never asked for (and so
// can never invent) a panelist ID or URL.
export async function answerExpertMatch(
  question: string,
  candidates: ExpertMatchCandidateProfile[]
): Promise<ExpertMatchAnswer> {
  if (candidates.length === 0) {
    return {
      matched: false,
      message: "No experts in the current library seem related to that question.",
      recommendations: [],
    };
  }

  const profiles = candidates
    .map(
      (c) => `--- Candidate ${c.index}: ${c.name}${c.title ? ` (${c.title})` : ""} ---
Bio: ${c.guideBio}
Frameworks: ${c.guideFrameworks}
Takeaways: ${c.guideTakeaways}
Quotes: ${c.guideQuotes}
Action items: ${c.guideActionItems}`
    )
    .join("\n\n");

  const prompt = `You are helping a member of an expert-led community find the right expert(s) to help with their question, based ONLY on the guide content below extracted from each expert's session.

Member's question: "${question}"

${profiles}

Strict rules:
- Only recommend a candidate if their guide content above genuinely, specifically relates to the question -- not a vague or generic connection.
- Never attribute a stance, opinion, or piece of advice to a candidate that is not actually reflected in their guide content above.
- If none of the candidates above genuinely fit, say so honestly in "message" and return an empty "recommendations" array -- do not force a recommendation just to have an answer.
- Base every summary strictly on the guide content shown -- do not add outside knowledge or invent specifics.

Return ONLY valid JSON, no markdown, no preamble:
{
  "matched": true or false,
  "message": "A short, friendly 1-2 sentence intro to the recommendation(s) below, or an honest explanation if nothing fits",
  "recommendations": [
    { "candidateIndex": <number from the candidates above>, "summary": "2-3 sentences on why this candidate fits and their relevant approach, grounded strictly in their guide content above" }
  ]
}`;

  const text = await callClaudeForText({
    prompt,
    maxTokens: 1000,
    timeoutMs: EXPERT_MATCH_ANSWER_TIMEOUT_MS,
    timeoutMessage: "Expert matching took too long to generate an answer — please try again",
  });

  const parsed = parseClaudeJson<{
    matched?: unknown;
    message?: unknown;
    recommendations?: unknown;
  }>(text);

  const validIndexes = new Set(candidates.map((c) => c.index));
  const rawRecommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
  const recommendations = rawRecommendations
    .filter(
      (r): r is { candidateIndex: number; summary: string } =>
        typeof r === "object" &&
        r !== null &&
        typeof (r as Record<string, unknown>).candidateIndex === "number" &&
        validIndexes.has((r as Record<string, unknown>).candidateIndex as number) &&
        typeof (r as Record<string, unknown>).summary === "string"
    )
    .map((r) => ({ candidateIndex: r.candidateIndex, summary: r.summary }));

  return {
    matched: typeof parsed.matched === "boolean" ? parsed.matched : recommendations.length > 0,
    message: typeof parsed.message === "string" ? parsed.message : "",
    recommendations,
  };
}
