import { getGiftDirectory, type GiftDirectoryEntry } from "@/lib/eventAccess";
import BackToDashboardLink from "@/components/member/BackToDashboardLink";

export const dynamic = "force-dynamic";

interface GiftRow {
  key: string;
  label: string;
  panelistName: string;
  eventTitle: string;
  title: string | null;
  description: string | null;
  url: string | null;
}

// A panelist can have both a Free and a VIP gift -- getGiftDirectory
// returns one row per panelist, flattened here into one row per gift so
// each is its own card.
function flattenGifts(entries: GiftDirectoryEntry[]): GiftRow[] {
  const rows: GiftRow[] = [];
  for (const entry of entries) {
    const toolEntry = entry.toolEntry;
    if (!toolEntry) continue;
    const eventTitle = entry.event.titleYoutube ?? entry.event.titleOriginal;

    if (toolEntry.freeGiftTitle || toolEntry.freeGiftUrl) {
      rows.push({
        key: `${entry.id}-free`,
        label: "Free Gift",
        panelistName: entry.name,
        eventTitle,
        title: toolEntry.freeGiftTitle,
        description: toolEntry.freeGiftDescription,
        url: toolEntry.freeGiftUrl,
      });
    }
    if (toolEntry.vipGiftTitle || toolEntry.vipGiftUrl) {
      rows.push({
        key: `${entry.id}-vip`,
        label: "VIP Gift",
        panelistName: entry.name,
        eventTitle,
        title: toolEntry.vipGiftTitle,
        description: toolEntry.vipGiftDescription,
        url: toolEntry.vipGiftUrl,
      });
    }
  }
  return rows;
}

export default async function ToolsPage() {
  const entries = await getGiftDirectory();
  const gifts = flattenGifts(entries);

  return (
    <div className="max-w-5xl">
      <BackToDashboardLink />
      <div className="mt-3 mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Tools & Resources</h1>
        <p className="text-sm text-gray-500 mt-1">
          Free and VIP gifts from every expert, in one place.
        </p>
      </div>

      {gifts.length === 0 ? (
        <p className="text-sm text-gray-500">No tools or resources available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gifts.map((gift) => (
            <div key={gift.key} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-semibold text-brand-orange uppercase tracking-wide mb-2">
                {gift.label}
              </p>
              {gift.title && (
                <p className="text-sm font-semibold text-gray-900">{gift.title}</p>
              )}
              <p className="text-xs text-gray-500 mt-0.5">
                {gift.panelistName} · {gift.eventTitle}
              </p>
              {gift.description && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-3">{gift.description}</p>
              )}
              {gift.url && (
                <a
                  href={gift.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-brand-navy font-medium mt-3"
                >
                  Get it →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
