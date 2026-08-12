interface OrbitExpert {
  id: string;
  name: string;
  headshotUrl: string | null;
}

// Adapted from the design reference's fixed 6 hardcoded experts at fixed
// 60deg increments -- here the angle step is computed from however many
// real featured panelists were passed in (capped to 6 by the caller, so
// the ring doesn't get overcrowded), so it degrades gracefully with
// fewer than 6. Pure CSS animation, no interactivity, so this stays a
// server component.
export default function HeroOrbit({ experts }: { experts: OrbitExpert[] }) {
  const angleStep = experts.length > 0 ? 360 / experts.length : 0;

  return (
    <div className="relative w-full max-w-[480px] aspect-square mx-auto">
      <div className="absolute inset-[12%] rounded-full border border-dashed border-white/20" />

      <div className="absolute top-1/2 left-1/2 w-[38%] h-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#F26522,#0944B9_70%)] blur-[2px] shadow-[0_0_80px_10px_rgba(242,101,34,0.4)] animate-[pulseGlow_5s_ease-in-out_infinite]" />
      <div className="absolute top-1/2 left-1/2 w-[26%] h-[26%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#fff,#4ECDC4_80%)]" />

      {experts.length > 0 && (
        <div className="absolute inset-0 animate-[orbitSpin_80s_linear_infinite]">
          {experts.map((expert, i) => (
            <div
              key={expert.id}
              className="absolute top-1/2 left-1/2 w-[74px] h-[74px] -ml-[37px] -mt-[37px] rounded-full border-[3px] border-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.35)] overflow-hidden"
              style={{ transform: `rotate(${i * angleStep}deg) translate(0, -190px)` }}
            >
              <div className="w-full h-full animate-[orbitSpin_80s_linear_infinite_reverse]">
                {expert.headshotUrl ? (
                  <img
                    src={expert.headshotUrl}
                    alt={expert.name}
                    className="w-full h-full object-cover [filter:grayscale(0.15)_contrast(1.05)]"
                  />
                ) : (
                  <div className="w-full h-full bg-brand-navyDeep" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
