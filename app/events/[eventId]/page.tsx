import { notFound, redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { getPublicEvent, isGiftPublicWindow } from "@/lib/eventAccess";
import { normalizeToParagraph } from "@/lib/textFormatting";

export const dynamic = "force-dynamic";

// Points at the real Membership Offer Sales Page once it exists.
// Defaults to the homepage so this doesn't hard-fail before then.
const MEMBERSHIP_SALES_PAGE_URL = process.env.MEMBERSHIP_SALES_PAGE_URL || "/";

export default async function EventDetailPage({
  params,
}: {
  params: { eventId: string };
}) {
  const event = await getPublicEvent(params.eventId);
  if (!event) notFound();

  if (!isGiftPublicWindow(event)) {
    redirect(MEMBERSHIP_SALES_PAGE_URL);
  }

  const giftsAvailable = event.panelists.some((p) => p.toolEntry?.freeGiftTitle);

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {event.titleYoutube ?? event.titleOriginal}
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          {new Date(event.eventDate).toLocaleDateString()}
        </p>

        {event.recordingUrl && (
          <div className="mb-12">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Replay</h2>
            <a
              href={event.recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Watch the replay →
            </a>
          </div>
        )}

        {giftsAvailable && (
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Free Gifts</h2>
            <div className="space-y-4">
              {event.panelists
                .filter((p) => p.toolEntry?.freeGiftTitle)
                .map((p) => (
                  <div
                    key={p.id}
                    className="border border-gray-200 rounded-xl p-5"
                  >
                    <p className="text-sm font-medium text-gray-900 mb-1">{p.name}</p>
                    <p className="text-base font-semibold text-gray-900 mb-2">
                      {p.toolEntry!.freeGiftTitle}
                    </p>
                    {p.toolEntry!.freeGiftDescription && (
                      <p className="text-sm text-gray-600 mb-4">
                        {normalizeToParagraph(p.toolEntry!.freeGiftDescription)}
                      </p>
                    )}
                    {p.toolEntry!.freeGiftUrl && (
                      <a
                        href={p.toolEntry!.freeGiftUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                      >
                        Get the gift →
                      </a>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
