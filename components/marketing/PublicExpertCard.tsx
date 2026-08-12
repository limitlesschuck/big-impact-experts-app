// Shared by the Home page teaser, the Sales page's "Learn From The Best
// Experts" grid, and /experts -- three public, ungated consumers of the
// same panelist shape (title + shortBio + 250px square rounded
// headshot), matching the sizing convention used on the dashboard's
// directory cards and event speaker grid.
export interface PublicExpertCardData {
  id: string;
  name: string;
  titleByline: string | null;
  titleAreaOfExpertise: string | null;
  headshotUrl: string | null;
  bio: string | null;
  shortBio: string | null;
}

function panelistTitle(p: { titleByline: string | null; titleAreaOfExpertise: string | null }) {
  return p.titleByline || p.titleAreaOfExpertise || "";
}

export default function PublicExpertCard({ panelist }: { panelist: PublicExpertCardData }) {
  const title = panelistTitle(panelist);
  const bio = panelist.shortBio || panelist.bio;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {panelist.headshotUrl ? (
        <img
          src={panelist.headshotUrl}
          alt={panelist.name}
          className="w-full h-auto aspect-square max-w-[250px] max-h-[250px] rounded-xl object-cover mx-auto mb-3"
        />
      ) : (
        <div className="w-full aspect-square max-w-[250px] max-h-[250px] rounded-xl bg-gray-100 mx-auto mb-3" />
      )}
      <div className="min-w-0 text-center">
        <p className="text-sm font-semibold text-gray-900 truncate">{panelist.name}</p>
        {title && <p className="text-xs text-brand-orange truncate">{title}</p>}
        {bio && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{bio}</p>}
      </div>
    </div>
  );
}
