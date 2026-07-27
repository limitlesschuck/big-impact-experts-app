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
      <div className="w-full bg-brand-navy/5 border-y border-brand-navy/10 py-2.5 text-center text-xs font-medium text-brand-navy">
        This event has started
      </div>
    );
  }

  return (
    <div className="w-full bg-brand-navy/5 border-y border-brand-navy/10 py-2.5">
      <div className="max-w-3xl mx-auto px-6 flex items-center justify-center gap-2 text-xs font-medium text-brand-navy">
        <span className="text-gray-500">Starts in</span>
        <span className="tabular-nums">
          {parts.days}d {String(parts.hours).padStart(2, "0")}h{" "}
          {String(parts.minutes).padStart(2, "0")}m{" "}
          {String(parts.seconds).padStart(2, "0")}s
        </span>
      </div>
    </div>
  );
}
