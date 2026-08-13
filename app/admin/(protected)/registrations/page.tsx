"use client";

import { useEffect, useMemo, useState } from "react";

interface Registration {
  id: string;
  name: string;
  email: string;
  referredBy: string | null;
  emailSynced: boolean;
  createdAt: string;
  event: { id: string; titleOriginal: string };
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [referrerFilter, setReferrerFilter] = useState("");

  useEffect(() => {
    fetch("/api/admin/registrations")
      .then((res) => res.json())
      .then((data) => {
        setRegistrations(data.registrations ?? []);
        setLoading(false);
      });
  }, []);

  const referrerCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of registrations) {
      if (r.referredBy) counts.set(r.referredBy, (counts.get(r.referredBy) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [registrations]);

  const filtered = referrerFilter
    ? registrations.filter((r) => r.referredBy === referrerFilter)
    : registrations;

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Registrations</h1>
        <p className="text-sm text-gray-500 mt-1">
          Every event registration, with referral attribution captured from{" "}
          <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">?ref=</code> on /register.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <>
          {referrerCounts.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">By referrer</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setReferrerFilter("")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                    referrerFilter === ""
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  All ({registrations.length})
                </button>
                {referrerCounts.map(([referrer, count]) => (
                  <button
                    key={referrer}
                    type="button"
                    onClick={() => setReferrerFilter(referrer)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                      referrerFilter === referrer
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {referrer} ({count})
                  </button>
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <p className="text-sm text-gray-500">No registrations found.</p>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Name</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Email</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Event</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Referred by</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Synced</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-2.5 text-gray-900">{r.name}</td>
                      <td className="px-4 py-2.5 text-gray-600">{r.email}</td>
                      <td className="px-4 py-2.5 text-gray-600">{r.event.titleOriginal}</td>
                      <td className="px-4 py-2.5 text-gray-600">{r.referredBy ?? "—"}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`text-xs font-medium ${r.emailSynced ? "text-green-600" : "text-gray-400"}`}
                        >
                          {r.emailSynced ? "✓ Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500">{formatDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
