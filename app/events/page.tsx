import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

async function getPublishedEvents() {
  return prisma.event.findMany({
    where: { publishStatus: "published" },
    orderBy: { eventDate: "desc" },
    select: {
      id: true,
      slug: true,
      titleOriginal: true,
      titleYoutube: true,
      eventDate: true,
      panelists: { select: { id: true, name: true } },
    },
  });
}

export default async function EventsPage() {
  const events = await getPublishedEvents();

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Events</h1>
        {events.length === 0 ? (
          <p className="text-sm text-gray-500">No events published yet.</p>
        ) : (
          <div className="space-y-4">
            {events.map((ev) => (
              <Link
                key={ev.id}
                href={`/events/${ev.slug ?? ev.id}`}
                className="block border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors"
              >
                <p className="text-sm font-medium text-gray-900">
                  {ev.titleYoutube ?? ev.titleOriginal}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(ev.eventDate).toLocaleDateString()}
                  {ev.panelists.length > 0 &&
                    ` — ${ev.panelists.map((p) => p.name).join(", ")}`}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
