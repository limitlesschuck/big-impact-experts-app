// Collapses arbitrary, inconsistently-formatted source text (e.g. raw
// Collab Pilot free gift descriptions, which vary wildly submitter to
// submitter -- emoji-per-line, ALL-CAPS quoted blocks, stray line
// breaks) into one clean flowing paragraph, dropping any line that's
// nothing but a bullet/checkmark/emoji symbol. Shared by the panelist
// guide PDF and the public Event Page, since both render the same
// free gift description field.
const SYMBOL_ONLY_LINE_RE = /^[\p{Extended_Pictographic}•✓✔\-*\s]+$/u;

export function normalizeToParagraph(text: string): string {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !SYMBOL_ONLY_LINE_RE.test(l))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
