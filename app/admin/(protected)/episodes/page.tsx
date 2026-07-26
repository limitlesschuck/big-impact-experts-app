"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Panelist {
  id: string;
  name: string;
}

interface EventRow {
  id: string;
  eventDate: string;
  titleOriginal: string;
  titleYoutube: string | null;
  hostName: string | null;
  publishStatus: string;
  youtubeId: string | null;
  panelists: Panelist[];
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  ai_generated: "bg-blue-50 text-blue-700",
  approved: "bg-amber-50 text-amber-700",
  published: "bg-green-50 text-green-700",
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadEvents(status: string) {
    setLoading(true);
    const params = status ? `?filter=${status}` : "";
    const res = await fetch(`/api/admin/episodes${params}`);
    const data = await res.json();
    setEvents(data.events ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }

  useEffect(() => {
    loadEvents(filter);
  }, [filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Events</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/episodes/new"
            className="px-4 py-2 text-sm font-medium text-white bg-brand-purple rounded-lg hover:bg-brand-purple-mid transition-colors"
          >
            Add Event
          </Link>
        </div>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        {["", "draft", "ai_generated", "approved", "published"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              filter === s
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {s === "" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading...
          </div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No events found.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                  Event
                </th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden sm:table-cell">
                  Panelists
                </th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden md:table-cell">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden lg:table-cell">
                  Event date
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {ev.titleYoutube ?? ev.titleOriginal}
                    </p>
                    {ev.hostName && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Host: {ev.hostName}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs text-gray-600">
                      {ev.panelists.length > 0
                        ? ev.panelists.map((p) => p.name).join(", ")
                        : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        STATUS_STYLES[ev.publishStatus] ??
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {ev.publishStatus.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-gray-500">
                      {new Date(ev.eventDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/episodes/${ev.id}`}
                      className="text-xs font-medium text-gray-900 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
