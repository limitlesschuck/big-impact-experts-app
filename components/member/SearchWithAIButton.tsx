"use client";

import { useExpertMatch } from "@/components/member/ExpertMatchContext";

export default function SearchWithAIButton() {
  const { setOpen } = useExpertMatch();

  return (
    <button
      onClick={() => setOpen(true)}
      className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-brand-orange text-white text-lg font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-sm"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <circle cx="11" cy="11" r="7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Search with AI
    </button>
  );
}
