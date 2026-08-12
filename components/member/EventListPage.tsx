import Link from "next/link";
import {
  getMemberDashboardEvents,
  getEpisodeCardImagePreference,
  pickEpisodeThumbnail,
} from "@/lib/eventAccess";
import BackToDashboardLink from "@/components/member/BackToDashboardLink";

// Shared by /dashboard/replays and /dashboard/training -- identical
// structure, just a different eventType filter and heading copy (this was
// the entire body of the old /dashboard landing page before the big-block
// redesign split it into two destinations).

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

export default async function EventListPage({
  eventType,
  heading,
  subheading,
  emptyMessage,
}: {
  eventType: "panel" | "training";
  heading: string;
  subheading: string;
  emptyMessage: string;
}) {
  const [events, thumbnailPreference] = await Promise.all([
    getMemberDashboardEvents(eventType),
    getEpisodeCardImagePreference(),
  ]);

  return (
    <div className="max-w-5xl">
      <BackToDashboardLink />
      <div className="mt-3 mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">{heading}</h1>
        <p className="text-sm text-gray-500 mt-1">{subheading}</p>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const thumbnail = pickEpisodeThumbnail(event, thumbnailPreference);
            return (
              <Link
                key={event.id}
                href={`/dashboard/events/${event.id}`}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-gray-100">
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={event.titleYoutube ?? event.titleOriginal}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                    {event.titleYoutube ?? event.titleOriginal}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(event.eventDate)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
