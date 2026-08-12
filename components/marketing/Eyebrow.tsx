// Small orange line + uppercase label, used above a section's opening
// statement (Membership's "What Is Big Impact Experts" treatment).
// Shared with Home wherever the same editorial-intro moment fits.
export default function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3.5 mb-5">
      <span className="w-9 h-0.5 bg-brand-orange block" />
      <span className="text-sm font-bold tracking-widest uppercase text-brand-orange">
        {children}
      </span>
    </div>
  );
}
