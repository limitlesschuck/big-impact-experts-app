import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

async function getEvent(idOrSlug: string) {
  return prisma.event.findFirst({
    where: {
      publishStatus: "published",
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: { panelists: true },
  });
}

// Placeholder — the real public Event Page (replay + time-gated free
// gifts per phase-1-spec-addendum.md Section 6) is a follow-up task
// once there's BIE copy/branding to build it from.
export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getEvent(params.id);
  if (!event) notFound();

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {event.titleYoutube ?? event.titleOriginal}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {new Date(event.eventDate).toLocaleDateString()}
        </p>

        {event.recordingUrl && (
          <a
            href={event.recordingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mb-8 text-sm font-medium text-brand-purple hover:underline"
          >
            Watch the replay →
          </a>
        )}

        {event.panelists.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Panelists</h2>
            <div className="space-y-3">
              {event.panelists.map((p) => (
                <div key={p.id} className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  {p.titleByline && (
                    <p className="text-xs text-gray-500">{p.titleByline}</p>
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
