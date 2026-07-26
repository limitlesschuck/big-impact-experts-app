"use client";

import { useEffect, useState } from "react";

interface GuideDownloadEntry {
  id: string;
  episodeId: string;
  episodeTitle: string;
  createdAt: string;
}

interface Lead {
  id: string;
  firstName: string | null;
  email: string;
  crisisCategory: string;
  crisisDuration: string | null;
  urgency: string | null;
  score: number | null;
  resultType: string | null;
  emailSynced: boolean;
  createdAt: string;
  sourceEpisode: { id: string; titleOriginal: string } | null;
  guideDownloads: GuideDownloadEntry[];
}

interface GuideOption {
  id: string;
  title: string;
}

const RESULT_STYLES: Record<string, string> = {
  coach_referral: "bg-red-50 text-red-700",
  resource: "bg-blue-50 text-blue-700",
  nurture: "bg-green-50 text-green-700",
};

const URGENCY_STYLES: Record<string, string> = {
  crisis: "bg-red-100 text-red-800",
  struggling: "bg-amber-100 text-amber-800",
  healing: "bg-blue-100 text-blue-800",
  exploring: "bg-green-100 text-green-800",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [resultFilter, setResultFilter] = useState("");
  const [guideFilter, setGuideFilter] = useState("");
  const [guideOptions, setGuideOptions] = useState<GuideOption[]>([]);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [categoryLabels, setCategoryLabels] = useState<Record<string, string>>({});

  async function loadLeads() {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoryFilter) params.set("category", categoryFilter);
    if (resultFilter) params.set("resultType", resultFilter);
    if (guideFilter) params.set("guideEpisodeId", guideFilter);
    const res = await fetch(`/api/admin/leads?${params}`);
    const data = await res.json();
    setLeads(data.leads ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }

  async function loadGuideOptions() {
    const res = await fetch(`/api/admin/guides`);
    const data = await res.json();
    setGuideOptions(data.guides ?? []);
  }

  function handleExport() {
    const params = new URLSearchParams();
    if (categoryFilter) params.set("category", categoryFilter);
    if (resultFilter) params.set("resultType", resultFilter);
    if (guideFilter) params.set("guideEpisodeId", guideFilter);
    params.set("format", "csv");
    window.open(`/api/admin/leads?${params}`, "_blank");
  }

  useEffect(() => {
    loadGuideOptions();
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => {
        const map = Object.fromEntries(
          (data.categories ?? []).map((c: { value: string; label: string }) => [c.value, c.label])
        );
        setCategoryLabels(map);
      });
  }, []);

  useEffect(() => {
    loadLeads();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, resultFilter, guideFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total</p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">All categories</option>
          {Object.entries(categoryLabels).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        <select
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">All result types</option>
          <option value="coach_referral">Coach referral</option>
          <option value="resource">Resource</option>
          <option value="nurture">Nurture</option>
        </select>

        <select
          value={guideFilter}
          onChange={(e) => setGuideFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">All guides</option>
          {guideOptions.map((g) => (
            <option key={g.id} value={g.id}>{g.title}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-sm text-gray-500">Loading...</div>
            ) : leads.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                No leads found.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Contact</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden sm:table-cell">Category</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden md:table-cell">Urgency</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden lg:table-cell">Result</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden lg:table-cell">Synced</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden xl:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelected(lead)}
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${selected?.id === lead.id ? "bg-purple-50" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">
                          {lead.firstName ?? "—"}
                        </p>
                        <p className="text-xs text-gray-500">{lead.email}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-gray-600">
                          {categoryLabels[lead.crisisCategory] ?? lead.crisisCategory}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {lead.urgency && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${URGENCY_STYLES[lead.urgency] ?? "bg-gray-100 text-gray-600"}`}>
                            {lead.urgency}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {lead.resultType && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${RESULT_STYLES[lead.resultType] ?? "bg-gray-100 text-gray-600"}`}>
                            {lead.resultType.replace("_", " ")}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`text-xs font-medium ${lead.emailSynced ? "text-green-600" : "text-gray-400"}`}>
                          {lead.emailSynced ? "✓ Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <span className="text-xs text-gray-400">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Lead detail panel */}
        <div>
          {selected ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">Lead detail</h2>
                <button
                  onClick={() => setSelected(null)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-3">
                <DetailRow label="Name" value={selected.firstName ?? "—"} />
                <DetailRow label="Email" value={selected.email} />
                <DetailRow
                  label="Category"
                  value={categoryLabels[selected.crisisCategory] ?? selected.crisisCategory}
                />
                <DetailRow
                  label="Duration"
                  value={selected.crisisDuration?.replace(/_/g, " ") ?? "—"}
                />
                <DetailRow label="Urgency" value={selected.urgency ?? "—"} />
                <DetailRow label="Score" value={selected.score?.toString() ?? "—"} />
                <DetailRow
                  label="Result type"
                  value={selected.resultType?.replace(/_/g, " ") ?? "—"}
                />
                <DetailRow
                  label="Email synced"
                  value={selected.emailSynced ? "Yes" : "No"}
                />
                <DetailRow
                  label="Source episode"
                  value={selected.sourceEpisode?.titleOriginal ?? "Direct"}
                />
                <DetailRow
                  label="Date"
                  value={new Date(selected.createdAt).toLocaleString()}
                />
              </div>

              {selected.guideDownloads.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 mb-2">
                    Guide downloads ({selected.guideDownloads.length})
                  </h3>
                  <div className="space-y-2">
                    {selected.guideDownloads.map((d) => (
                      <div key={d.id} className="flex items-start justify-between gap-2">
                        <span className="text-xs text-gray-900">{d.episodeTitle}</span>
                        <span className="text-xs text-gray-400 shrink-0">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100">
                <a
                  href={`mailto:${selected.email}`}
                  className="w-full block text-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Email this lead
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
              <p className="text-sm text-gray-400">
                Click any lead to see full details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs font-medium text-gray-500 shrink-0">{label}</span>
      <span className="text-xs text-gray-900 text-right">{value}</span>
    </div>
  );
}
