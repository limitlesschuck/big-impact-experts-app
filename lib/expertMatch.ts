import { getExpertMatchPool, type ExpertMatchPoolPanelist } from "@/lib/eventAccess";
import { narrowExpertCandidates, answerExpertMatch } from "@/lib/claude";

const NARROW_BLURB_MAX_LENGTH = 280;

function panelistTitle(p: { titleByline: string | null; titleAreaOfExpertise: string | null }): string {
  return p.titleByline || p.titleAreaOfExpertise || "";
}

function truncate(text: string | null, maxLength: number): string {
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export interface ExpertMatchRecommendation {
  name: string;
  summary: string;
  href: string;
}

export interface ExpertMatchResponse {
  matched: boolean;
  message: string;
  recommendations: ExpertMatchRecommendation[];
}

export async function matchExpertsToQuestion(question: string): Promise<ExpertMatchResponse> {
  const pool = await getExpertMatchPool();

  if (pool.length === 0) {
    return {
      matched: false,
      message: "No expert guides are available to search yet.",
      recommendations: [],
    };
  }

  const indexed: (ExpertMatchPoolPanelist & { index: number })[] = pool.map((p, index) => ({
    ...p,
    index,
  }));

  const narrowCandidates = indexed.map((p) => ({
    index: p.index,
    name: p.name,
    title: panelistTitle(p),
    blurb: truncate(p.guideTakeaways, NARROW_BLURB_MAX_LENGTH) || truncate(p.guideBio, NARROW_BLURB_MAX_LENGTH),
  }));

  const shortlistedIndexes = await narrowExpertCandidates(question, narrowCandidates);

  if (shortlistedIndexes.length === 0) {
    return {
      matched: false,
      message: "No experts in the current library seem related to that question.",
      recommendations: [],
    };
  }

  const shortlisted = indexed.filter((p) => shortlistedIndexes.includes(p.index));

  const fullCandidates = shortlisted.map((p) => ({
    index: p.index,
    name: p.name,
    title: panelistTitle(p),
    guideBio: p.guideBio ?? "",
    guideFrameworks: p.guideFrameworks ?? "",
    guideTakeaways: p.guideTakeaways ?? "",
    guideQuotes: p.guideQuotes ?? "",
    guideActionItems: p.guideActionItems ?? "",
  }));

  const answer = await answerExpertMatch(question, fullCandidates);

  // Claude only ever returned a numeric candidateIndex -- the real id/
  // eventId used to build the link never passed through the model at
  // all, so a hallucinated or mismatched link is structurally impossible
  // here, not just unlikely.
  const byIndex = new Map(indexed.map((p) => [p.index, p]));
  const recommendations: ExpertMatchRecommendation[] = answer.recommendations
    .map((r) => {
      const panelist = byIndex.get(r.candidateIndex);
      if (!panelist) return null;
      return {
        name: panelist.name,
        summary: r.summary,
        href: `/dashboard/events/${panelist.eventId}/experts/${panelist.id}`,
      };
    })
    .filter((r): r is ExpertMatchRecommendation => r !== null);

  return {
    matched: answer.matched && recommendations.length > 0,
    message: answer.message,
    recommendations,
  };
}
