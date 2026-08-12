import { getGuideDirectory } from "@/lib/eventAccess";
import BackToDashboardLink from "@/components/member/BackToDashboardLink";

export const dynamic = "force-dynamic";

function panelistTitle(p: { titleByline: string | null; titleAreaOfExpertise: string | null }) {
  return p.titleByline || p.titleAreaOfExpertise || "";
}

export default async function GuidesPage() {
  const guides = await getGuideDirectory();

  return (
    <div className="max-w-5xl">
      <BackToDashboardLink />
      <div className="mt-3 mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Guides & Checklists</h1>
        <p className="text-sm text-gray-500 mt-1">
          Every expert's guide — frameworks, takeaways, and action items, ready to download.
        </p>
      </div>

      {guides.length === 0 ? (
        <p className="text-sm text-gray-500">No guides available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((g) => (
            <a
              key={g.id}
              href={g.guidePdfUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <p className="text-xs font-semibold text-brand-orange uppercase tracking-wide mb-2">
                Guide
              </p>
              <p className="text-sm font-semibold text-gray-900">{g.name}</p>
              {panelistTitle(g) && (
                <p className="text-xs text-gray-500 mt-0.5">{panelistTitle(g)}</p>
              )}
              <p className="text-xs text-gray-400 mt-2 truncate">
                From {g.event.titleYoutube ?? g.event.titleOriginal}
              </p>
              <p className="text-sm text-brand-navy font-medium mt-3">Download PDF →</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
