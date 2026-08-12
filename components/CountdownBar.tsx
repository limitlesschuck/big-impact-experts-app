"use client";

import { useEffect, useState } from "react";
import { DISPLAY } from "@/lib/fonts";

function getTimeParts(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Unit({ value, label, orange = false }: { value: number; label: string; orange?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={`${DISPLAY} rp-countdown-digit font-extrabold tabular-nums ${orange ? "rp-orange" : "text-white"}`}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span className="rp-countdown-label font-semibold tracking-widest text-white/50 mt-2">
        {label}
      </span>
    </div>
  );
}

// Mirrors Unit's digit + label structure exactly (down to the invisible
// label-sized spacer) so the colon's digit line lands at the same height
// as the surrounding digits regardless of the configured font size --
// a fixed margin nudge would only stay correct for one specific size.
function Colon() {
  return (
    <div className="flex flex-col items-center" aria-hidden="true">
      <span className={`${DISPLAY} rp-countdown-digit font-extrabold text-white/25`}>:</span>
      <span className="rp-countdown-label font-semibold mt-2 invisible">:</span>
    </div>
  );
}

interface CountdownBarProps {
  eventDate: string;
  dayLabel: string;
  hourLabel: string;
  minuteLabel: string;
  secondLabel: string;
  finishedMessage: string;
}

// Lives inline in the hero's own navy background -- no card/box of
// its own. Days/hours/minutes white, seconds orange, muted colons.
// Sizing/coloring comes from the rp-* classes injected page-wide by
// the admin-configurable register page settings, not hardcoded
// Tailwind text-size classes.
export default function CountdownBar({
  eventDate,
  dayLabel,
  hourLabel,
  minuteLabel,
  secondLabel,
  finishedMessage,
}: CountdownBarProps) {
  const target = new Date(eventDate);
  const [parts, setParts] = useState(() => getTimeParts(target));

  useEffect(() => {
    const interval = setInterval(() => setParts(getTimeParts(target)), 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventDate]);

  if (parts.diff <= 0) {
    return <p className="text-base font-medium text-white/80 text-center">{finishedMessage}</p>;
  }

  return (
    <div className="flex items-start justify-center gap-3 sm:gap-5 lg:gap-6">
      <Unit value={parts.days} label={dayLabel} />
      <Colon />
      <Unit value={parts.hours} label={hourLabel} />
      <Colon />
      <Unit value={parts.minutes} label={minuteLabel} />
      <Colon />
      <Unit value={parts.seconds} label={secondLabel} orange />
    </div>
  );
}
