"use client";

import { useState } from "react";
import Link from "next/link";
import type { DirectoryPanelist } from "@/lib/eventAccess";

function panelistTitle(p: { titleByline: string | null; titleAreaOfExpertise: string | null }) {
  return p.titleByline || p.titleAreaOfExpertise || "";
}

export default function DirectorySearch({ panelists }: { panelists: DirectoryPanelist[] }) {
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
        className="w-full max-w-sm px-3 py-2 text-sm border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No experts match &ldquo;{query}&rdquo;.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/events/${p.eventId}/experts/${p.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 flex gap-4 hover:shadow-md transition-shadow"
            >
              {p.headshotUrl ? (
                <img
                  src={p.headshotUrl}
                  alt={p.name}
                  className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-100 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                {panelistTitle(p) && (
                  <p className="text-xs text-brand-orange truncate">{panelistTitle(p)}</p>
                )}
                {(p.shortBio || p.bio) && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.shortBio || p.bio}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
