import { DISPLAY } from "@/lib/fonts";

export interface DuotoneExpertCardData {
  id: string;
  name: string;
  headshotUrl: string | null;
  titleByline: string | null;
  titleAreaOfExpertise: string | null;
}

function panelistSpecialty(p: { titleByline: string | null; titleAreaOfExpertise: string | null }) {
  return p.titleByline || p.titleAreaOfExpertise || "";
}

// The dark duotone photo card from Membership's "Learn From The Best
// Experts" section -- shared with Home's "Meet Our Experts" teaser,
// since both are the same signature moment (a dark section spotlighting
// real panelists), just at different grid sizes.
export default function DuotoneExpertCard({ panelist }: { panelist: DuotoneExpertCardData }) {
  const specialty = panelistSpecialty(panelist);

  return (
    <div className="rounded-[20px] overflow-hidden bg-[#141C30]">
      <div className="relative aspect-[4/5] overflow-hidden">
        {panelist.headshotUrl ? (
          <img
            src={panelist.headshotUrl}
            alt={panelist.name}
            className="w-full h-full object-cover [filter:grayscale(1)_contrast(1.1)_brightness(1.05)]"
          />
        ) : (
          <div className="w-full h-full bg-brand-navyDeep" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(200deg,rgba(9,68,185,0.55),rgba(78,205,196,0.35))] mix-blend-color" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,18,32,0.9),transparent_55%)]" />
        <div className="absolute left-4 right-4 bottom-3.5">
          <div className={`${DISPLAY} font-bold text-lg text-white`}>{panelist.name}</div>
          {specialty && (
            <div className="text-[13px] font-semibold text-brand-teal mt-0.5">{specialty}</div>
          )}
        </div>
      </div>
    </div>
  );
}
