import Link from "next/link";
import { notFound } from "next/navigation";
import { getMemberDashboardEvent } from "@/lib/eventAccess";
import { parseVimeoUrl, buildVimeoEmbedUrl } from "@/lib/vimeo";

export const dynamic = "force-dynamic";

function panelistTitle(p: { titleByline: string | null; titleAreaOfExpertise: string | null }) {
  return p.titleByline || p.titleAreaOfExpertise || "";
}

export default async function EventDetailPage({
  params,
}: {
  params: { eventId: string };
}) {
  const event = await getMemberDashboardEvent(params.eventId);
  if (!event) notFound();

  const vimeo = event.recordingUrl ? parseVimeoUrl(event.recordingUrl) : null;

  return (
    <div className="max-w-5xl">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
        ← Back to Your Events
      </Link>

      <h1 className="text-2xl font-semibold text-gray-900 mt-3 mb-6">
        {event.titleYoutube ?? event.titleOriginal}
      </h1>

      {vimeo ? (
        <div className="relative w-full pb-[56.25%] h-0 rounded-xl overflow-hidden bg-black mb-10">
          <iframe
            src={buildVimeoEmbedUrl(vimeo)}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-10">Replay not available yet.</p>
      )}

      <h2 className="text-sm font-semibold text-gray-900 mb-4">Experts</h2>
      {event.panelists.length === 0 ? (
        <p className="text-sm text-gray-500">No experts listed for this event.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {event.panelists.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/events/${event.id}/experts/${p.id}`}
              className="text-center group"
            >
              {p.headshotUrl ? (
                <img
                  src={p.headshotUrl}
                  alt={p.name}
                  className="w-full h-auto aspect-square max-w-[250px] max-h-[250px] rounded-xl object-cover mx-auto mb-2 border border-gray-200 group-hover:border-brand-orange transition-colors"
                />
              ) : (
                <div className="w-full aspect-square max-w-[250px] max-h-[250px] rounded-xl bg-gray-100 mx-auto mb-2" />
              )}
              <p className="text-xs font-medium text-gray-900">{p.name}</p>
              {panelistTitle(p) && (
                <p className="text-xs text-gray-500 mt-0.5">{panelistTitle(p)}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
