import { DISPLAY } from "@/lib/fonts";

// Standard section heading + optional subhead used throughout Membership
// and Home. `light` swaps to white text for dark section backgrounds
// (e.g. the duotone experts section).
export default function SectionHeading({
  heading,
  subhead,
  light,
}: {
  heading: string;
  subhead?: string;
  light?: boolean;
}) {
  return (
    <div className="mb-11">
      <h2
        className={`${DISPLAY} text-[clamp(28px,3.4vw,42px)] font-extrabold tracking-tight mb-3 ${
          light ? "text-white" : "text-brand-ink"
        }`}
      >
        {heading}
      </h2>
      {subhead && (
        <p className={`text-[17px] max-w-xl ${light ? "text-white/60" : "text-brand-muted"}`}>
          {subhead}
        </p>
      )}
    </div>
  );
}
