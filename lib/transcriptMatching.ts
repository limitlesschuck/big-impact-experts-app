// Zoom VTT parsing + fuzzy speaker matching for transcript attribution.
// See phase-1-spec-addendum.md Section 3 for the pipeline this implements.

export interface ParsedSegment {
  rawSpeakerLabel: string;
  text: string;
}

interface VttCue {
  speaker: string;
  text: string;
}

const SPEAKER_LINE_RE = /^([^:]{1,80}):\s*([\s\S]*)$/;

function parseVttCues(vtt: string): VttCue[] {
  const normalized = vtt.replace(/\r\n/g, "\n");
  const blocks = normalized
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const cues: VttCue[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0 || lines[0] === "WEBVTT") continue;

    let idx = 0;
    if (/^\d+$/.test(lines[idx])) idx++;
    if (idx < lines.length && lines[idx].includes("-->")) {
      idx++;
    } else {
      continue; // not a valid cue block
    }

    const textLines = lines.slice(idx);
    if (textLines.length === 0) continue;
    const fullText = textLines.join(" ");

    const match = fullText.match(SPEAKER_LINE_RE);
    if (match) {
      cues.push({ speaker: match[1].trim(), text: match[2].trim() });
    } else {
      cues.push({ speaker: "Unknown", text: fullText });
    }
  }

  return cues;
}

// Groups consecutive cues sharing the same raw speaker label into one
// segment, per spec Section 3's pipeline diagram.
export function parseVttToSegments(vtt: string): ParsedSegment[] {
  const cues = parseVttCues(vtt);
  const segments: ParsedSegment[] = [];

  for (const cue of cues) {
    const last = segments[segments.length - 1];
    if (last && last.rawSpeakerLabel === cue.speaker) {
      last.text = `${last.text} ${cue.text}`;
    } else {
      segments.push({ rawSpeakerLabel: cue.speaker, text: cue.text });
    }
  }

  return segments;
}

const TITLE_PREFIX_RE = /^(dr|mr|mrs|ms|prof|rev)\.?\s+/i;
const EMOJI_RE = /\p{Extended_Pictographic}/gu;
const URL_RE = /\b(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\/\S*)?\b/gi;

export function normalizeSpeakerLabel(raw: string): string {
  let s = raw.toLowerCase();
  s = s.replace(EMOJI_RE, " ");
  s = s.replace(URL_RE, " ");
  s = s.replace(TITLE_PREFIX_RE, "");
  s = s.replace(/[^a-z0-9\s]/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

function bigrams(str: string): string[] {
  const grams: string[] = [];
  for (let i = 0; i < str.length - 1; i++) {
    grams.push(str.slice(i, i + 2));
  }
  return grams;
}

// Dice's coefficient (bigram overlap), 0-1. Same algorithm the
// (now-unmaintained) `string-similarity` package uses -- inlined here
// instead of taking a dependency on an abandoned package for ~15 lines
// of well-understood math.
export function diceCoefficient(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;

  const bigramsA = bigrams(a);
  const bigramsB = bigrams(b);
  const bMap = new Map<string, number>();
  for (const bg of bigramsB) bMap.set(bg, (bMap.get(bg) ?? 0) + 1);

  let intersection = 0;
  for (const bg of bigramsA) {
    const count = bMap.get(bg) ?? 0;
    if (count > 0) {
      intersection++;
      bMap.set(bg, count - 1);
    }
  }

  return (2 * intersection) / (bigramsA.length + bigramsB.length);
}

export interface MatchCandidate {
  id: string;
  name: string;
}

export interface MatchResult {
  matchedId: string | null;
  confidenceScore: number | null;
}

// Two-tier match: exact substring containment (after normalization) is
// treated as certain (1.0); otherwise falls back to Dice's coefficient
// across all candidates and takes the best score.
export function matchSpeaker(
  rawLabel: string,
  candidates: MatchCandidate[]
): MatchResult {
  if (candidates.length === 0) return { matchedId: null, confidenceScore: null };

  const normalizedLabel = normalizeSpeakerLabel(rawLabel);
  if (!normalizedLabel) return { matchedId: null, confidenceScore: null };

  for (const c of candidates) {
    const normalizedName = normalizeSpeakerLabel(c.name);
    if (!normalizedName) continue;
    if (
      normalizedLabel.includes(normalizedName) ||
      normalizedName.includes(normalizedLabel)
    ) {
      return { matchedId: c.id, confidenceScore: 1.0 };
    }
  }

  let bestId: string | null = null;
  let bestScore = -1;
  for (const c of candidates) {
    const normalizedName = normalizeSpeakerLabel(c.name);
    const score = diceCoefficient(normalizedLabel, normalizedName);
    if (score > bestScore) {
      bestScore = score;
      bestId = c.id;
    }
  }

  return { matchedId: bestId, confidenceScore: bestScore < 0 ? null : bestScore };
}

export const HOST_MATCH_THRESHOLD = 0.6;

export const CONFIDENCE_TIERS = {
  high: 0.8,
  medium: 0.5,
} as const;

export function confidenceTier(score: number | null): "high" | "medium" | "low" {
  if (score === null) return "low";
  if (score >= CONFIDENCE_TIERS.high) return "high";
  if (score >= CONFIDENCE_TIERS.medium) return "medium";
  return "low";
}
