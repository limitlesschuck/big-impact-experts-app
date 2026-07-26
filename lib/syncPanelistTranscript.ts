import { prisma } from "@/lib/prisma";

// Recomputes Panelist.transcriptSegment as the concatenation of that
// panelist's approved TranscriptSegment rows, in order. This is the only
// integration point with AI guide generation (generate-guide/route.ts
// already reads Panelist.transcriptSegment) -- no changes needed there.
export async function syncPanelistTranscript(panelistId: string): Promise<void> {
  const approved = await prisma.transcriptSegment.findMany({
    where: { matchedPanelistId: panelistId, status: "approved" },
    orderBy: { order: "asc" },
  });

  const combined = approved.length > 0 ? approved.map((s) => s.text).join("\n\n") : null;

  await prisma.panelist.update({
    where: { id: panelistId },
    data: { transcriptSegment: combined },
  });
}
