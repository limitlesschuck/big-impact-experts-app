import Link from "next/link";
import { notFound } from "next/navigation";
import { getMemberDashboardPanelist } from "@/lib/eventAccess";
import { parseVimeoUrl, buildVimeoEmbedUrl } from "@/lib/vimeo";

export const dynamic = "force-dynamic";

function panelistTitle(p: { titleByline: string | null; titleAreaOfExpertise: string | null }) {
  return p.titleByline || p.titleAreaOfExpertise || "";
}

function GiftSection({
  label,
  giftTitle,
  description,
  url,
}: {
  label: string;
  giftTitle: string | null;
  description: string | null;
  url: string | null;
}) {
  if (!giftTitle && !url) return null;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <p className="text-xs font-semibold text-brand-orange uppercase tracking-wide mb-2">
        {label}
      </p>
      {giftTitle && <h3 className="text-base font-semibold text-gray-900 mb-2">{giftTitle}</h3>}
      {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-5 py-2.5 bg-brand-navy text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          Get it →
        </a>
      )}
    </div>
  );
}

export default async function PanelistDetailPage({
  params,
}: {
  params: { eventId: string; panelistId: string };
}) {
  const panelist = await getMemberDashboardPanelist(params.eventId, params.panelistId);
  if (!panelist) notFound();

  // clipUrl is meant to be a direct video file (the admin UI is explicit
  // about that), but nothing stops someone pasting a Vimeo link into a
  // plain text field anyway -- detect and embed it properly rather than
  // handing a page URL to a <video> tag, which would just fail silently.
  const vimeo = panelist.clipUrl ? parseVimeoUrl(panelist.clipUrl) : null;

  return (
    <div className="max-w-3xl">
      <Link
        href={`/dashboard/events/${params.eventId}`}
        className="text-sm text-gray-500 hover:text-gray-900"
      >
        ← Back to {panelist.event.titleYoutube ?? panelist.event.titleOriginal}
      </Link>

      <h1 className="text-2xl font-semibold text-gray-900 mt-3">{panelist.name}</h1>
      {panelistTitle(panelist) && (
        <p className="text-sm text-gray-500 mb-6">{panelistTitle(panelist)}</p>
      )}

      {panelist.clipUrl && (
        <div className="mb-8">
          {vimeo ? (
            <div className="relative w-full pb-[56.25%] h-0 rounded-xl overflow-hidden bg-black">
              <iframe
                src={buildVimeoEmbedUrl(vimeo)}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              />
            </div>
          ) : (
            <video src={panelist.clipUrl} controls className="w-full rounded-xl" />
          )}
        </div>
      )}

      <div className="space-y-4">
        {panelist.guidePdfUrl && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-xs font-semibold text-brand-orange uppercase tracking-wide mb-2">
              Guide
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Key frameworks and takeaways from {panelist.name}&rsquo;s session.
            </p>
            <a
              href={panelist.guidePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-5 py-2.5 bg-brand-navy text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Download the guide →
            </a>
          </div>
        )}

        <GiftSection
          label="Free Gift"
          giftTitle={panelist.toolEntry?.freeGiftTitle ?? null}
          description={panelist.toolEntry?.freeGiftDescription ?? null}
          url={panelist.toolEntry?.freeGiftUrl ?? null}
        />
        <GiftSection
          label="VIP Gift"
          giftTitle={panelist.toolEntry?.vipGiftTitle ?? null}
          description={panelist.toolEntry?.vipGiftDescription ?? null}
          url={panelist.toolEntry?.vipGiftUrl ?? null}
        />
      </div>
    </div>
  );
}
