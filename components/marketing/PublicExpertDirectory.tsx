"use client";

import { useState } from "react";
import PublicExpertCard, { type PublicExpertCardData } from "@/components/marketing/PublicExpertCard";

// Public counterpart to components/member/DirectorySearch.tsx -- same
// search-by-name behavior, but cards aren't links: the gated per-expert
// page (clip, guide, gifts) is members-only, so there's nowhere public to
// send a click. Membership is the CTA instead, not the card itself.
export default function PublicExpertDirectory({ panelists }: { panelists: PublicExpertCardData[] }) {
  const [query, setQuery] = useState("");

  const filtered = panelists.filter((p) =>
    p.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name..."
        className="w-full max-w-sm px-3 py-2 text-sm border border-gray-300 rounded-lg mb-8 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No experts match &ldquo;{query}&rdquo;.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <PublicExpertCard key={p.id} panelist={p} />
          ))}
        </div>
      )}
    </div>
  );
}
