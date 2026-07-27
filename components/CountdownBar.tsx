"use client";

import { useEffect, useState } from "react";

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
        className={`text-3xl sm:text-4xl font-bold tabular-nums ${
          orange ? "text-brand-orange" : "text-white"
        }`}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] font-semibold tracking-widest text-white/50 mt-1">
        {label}
      </span>
    </div>
  );
}

function Colon() {
  return (
    <span className="text-3xl sm:text-4xl font-bold text-white/25 -mt-4 sm:-mt-5">:</span>
  );
}

// Lives inline in the hero's own navy background -- no card/box of
// its own. Days/hours/minutes white, seconds orange, muted colons.
export default function CountdownBar({ eventDate }: { eventDate: string }) {
  const target = new Date(eventDate);
  const [parts, setParts] = useState(() => getTimeParts(target));

  useEffect(() => {
    const interval = setInterval(() => setParts(getTimeParts(target)), 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventDate]);

  if (parts.diff <= 0) {
    return (
      <p className="text-sm font-medium text-white/80 text-center">
        This event has started
      </p>
    );
  }

  return (
    <div className="flex items-start justify-center gap-2 sm:gap-4">
      <Unit value={parts.days} label="DAYS" />
      <Colon />
      <Unit value={parts.hours} label="HRS" />
      <Colon />
      <Unit value={parts.minutes} label="MIN" />
      <Colon />
      <Unit value={parts.seconds} label="SEC" orange />
    </div>
  );
}
