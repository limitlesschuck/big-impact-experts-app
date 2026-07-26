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
  guestBio: string;
  frameworks: string;
  takeaways: string;
  quotes: string;
  actionItems: string;
}

export async function generateGuideContent(params: {
  guestName: string | null;
  transcript: string | null;
  descriptionOriginal: string | null;
  showName?: string;
}): Promise<GeneratedGuideContent> {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("CLAUDE_API_KEY not set");

  const contentSource = params.transcript
    ? `TRANSCRIPT:\n${params.transcript.slice(0, 10000)}`
    : `SHOW NOTES:\n${params.descriptionOriginal ?? "Not provided"}`;

  const prompt = `You are an expert content creator for the Limitless Living Show podcast. Your job is to extract and structure the most valuable content from a podcast episode transcript into a downloadable episode guide for listeners.

Guest: ${params.guestName ?? "Not specified"}

${contentSource}

Generate a structured episode guide and return ONLY valid JSON with no markdown, no code fences, no preamble:

{
  "guestBio": "2-3 paragraph bio of the guest covering who they are, their background, credentials, and what makes them uniquely qualified to speak on this topic. Write in third person. 150-200 words.",
  "frameworks": "The 2-4 most important frameworks, systems, or methodologies shared in this episode. For each one: give it a name, describe what it is in 2-3 sentences, explain how to apply it in 3-5 bullet points. Format as clear sections separated by double newlines.",
  "takeaways": "The 5-7 most powerful insights or lessons from this episode. Each takeaway should be 2-3 sentences that capture the idea and why it matters. Format as a numbered list.",
  "quotes": "The 5-8 most memorable, quotable, and actionable direct quotes from the guest. Include only quotes that stand alone and deliver value without context. Format as a simple list with each quote on its own line starting with a quotation mark.",
  "actionItems": "A practical checklist of 8-12 action items the listener can implement immediately based on this episode. Each item should be specific and actionable, starting with a verb. Format as a simple list."
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
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Claude API error generating guide: ${res.status} — ${error}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text ?? "";

  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned) as GeneratedGuideContent;
  } catch {
    throw new Error(`Failed to parse guide response: ${text.slice(0, 200)}`);
  }
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
