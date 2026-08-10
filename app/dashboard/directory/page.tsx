import { getDirectoryPanelists } from "@/lib/eventAccess";
import DirectorySearch from "@/components/member/DirectorySearch";

export const dynamic = "force-dynamic";

export default async function DirectoryPage() {
  const panelists = await getDirectoryPanelists();

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Expert Directory</h1>
        <p className="text-sm text-gray-500 mt-1">{panelists.length} experts</p>
      </div>
      <DirectorySearch panelists={panelists} />
    </div>
  );
}
