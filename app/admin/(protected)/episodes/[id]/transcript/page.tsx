"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { confidenceTier } from "@/lib/transcriptMatching";

interface Panelist {
  id: string;
  name: string;
}

interface Segment {
  id: string;
  order: number;
  rawSpeakerLabel: string;
  text: string;
  matchedPanelistId: string | null;
  matchedPanelist: Panelist | null;
  confidenceScore: number | null;
  isHostExcluded: boolean;
  status: "pending" | "approved" | "rejected";
}

const TIER_STYLES: Record<ReturnType<typeof confidenceTier>, string> = {
  high: "bg-green-50 text-green-700 border-green-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-red-50 text-red-700 border-red-200",
};

const TIER_LABELS: Record<ReturnType<typeof confidenceTier>, string> = {
  high: "High confidence",
  medium: "Review recommended",
  low: "Needs manual match",
};

export default function TranscriptReviewPage() {
  const { id } = useParams<{ id: string }>();
  const [eventTitle, setEventTitle] = useState("");
  const [hasTranscript, setHasTranscript] = useState(true);
  const [panelists, setPanelists] = useState<Panelist[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  async function loadEvent() {
    const res = await fetch(`/api/admin/episodes/${id}`);
    const data = await res.json();
    setEventTitle(data.titleOriginal ?? "");
    setHasTranscript(!!data.transcriptRaw?.trim());
    setPanelists(data.panelists ?? []);
  }

  async function loadSegments() {
    const res = await fetch(`/api/admin/episodes/${id}/transcript-segments`);
    const data = await res.json();
    setSegments(data.segments ?? []);
  }

  async function loadAll() {
    setLoading(true);
    await Promise.all([loadEvent(), loadSegments()]);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, [id]);

  async function handleParse() {
    if (
      segments.length > 0 &&
      !confirm(
        "This re-parses the transcript. Already-approved segments are kept; all pending or rejected segments will be replaced. Continue?"
      )
    ) {
      return;
    }
    setParsing(true);
    setMessage(null);
    const res = await fetch(`/api/admin/episodes/${id}/parse-transcript`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setSegments(data.segments ?? []);
      setMessage({ type: "success", text: `Parsed ${data.segments?.length ?? 0} segments` });
    } else {
      setMessage({ type: "error", text: data.error ?? "Parse failed" });
    }
    setParsing(false);
  }

  async function patchSegment(segmentId: string, patch: Record<string, unknown>) {
    setActioningId(segmentId);
    setMessage(null);
    const res = await fetch(`/api/admin/episodes/${id}/transcript-segments/${segmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (res.ok) {
      setSegments((rows) => rows.map((r) => (r.id === segmentId ? data.segment : r)));
    } else {
      setMessage({ type: "error", text: data.error ?? "Update failed" });
    }
    setActioningId(null);
  }

  async function handleMergeWithNext(segment: Segment, next: Segment) {
    setActioningId(segment.id);
    setMessage(null);
    const res = await fetch(`/api/admin/episodes/${id}/transcript-segments/merge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ segmentIds: [segment.id, next.id] }),
    });
    const data = await res.json();
    if (res.ok) {
      setSegments((rows) =>
        rows.filter((r) => r.id !== next.id).map((r) => (r.id === segment.id ? data.segment : r))
      );
    } else {
      setMessage({ type: "error", text: data.error ?? "Merge failed" });
    }
    setActioningId(null);
  }

  async function handleSplit(segment: Segment) {
    const textarea = textareaRefs.current[segment.id];
    const splitAt = textarea?.selectionStart ?? 0;
    if (!textarea || splitAt <= 0 || splitAt >= segment.text.length) {
      setMessage({ type: "error", text: "Place your cursor inside the text to choose a split point" });
      return;
    }
    setActioningId(segment.id);
    setMessage(null);
    const res = await fetch(
      `/api/admin/episodes/${id}/transcript-segments/${segment.id}/split`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ splitAt }),
      }
    );
    const data = await res.json();
    if (res.ok) {
      await loadSegments();
      setMessage({ type: "success", text: "Segment split" });
    } else {
      setMessage({ type: "error", text: data.error ?? "Split failed" });
    }
    setActioningId(null);
  }

  if (loading) {
    return <div className="p-8 text-sm text-gray-500">Loading transcript segments...</div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/episodes/${id}`} className="text-sm text-gray-500 hover:text-gray-900">
          ← {eventTitle || "Event"}
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium">Transcript review</span>
      </div>

      {!hasTranscript ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-gray-500">
          No transcript uploaded for this event yet. Upload one from the Transcript section on
          the event detail page first.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {segments.length === 0
                ? "No segments parsed yet."
                : `${segments.length} segment${segments.length === 1 ? "" : "s"} — ` +
                  `${segments.filter((s) => s.status === "approved").length} approved`}
            </p>
            <button
              onClick={handleParse}
              disabled={parsing}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {parsing ? "Parsing..." : segments.length === 0 ? "Parse transcript" : "Re-parse"}
            </button>
          </div>

          {message && (
            <div
              className={`mb-4 px-4 py-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            {segments.map((segment, i) => {
              const tier = confidenceTier(segment.confidenceScore);
              const next = segments[i + 1];
              const busy = actioningId === segment.id;
              return (
                <div
                  key={segment.id}
                  className={`rounded-xl border p-4 ${
                    segment.isHostExcluded
                      ? "bg-gray-50 border-gray-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-xs font-mono text-gray-400">#{segment.order}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {segment.rawSpeakerLabel}
                    </span>
                    {segment.isHostExcluded && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                        Auto-excluded as host
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${TIER_STYLES[tier]}`}>
                      {TIER_LABELS[tier]}
                      {segment.confidenceScore !== null &&
                        ` (${Math.round(segment.confidenceScore * 100)}%)`}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ml-auto ${
                        segment.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : segment.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {segment.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Matched panelist
                      </label>
                      <select
                        value={segment.matchedPanelistId ?? ""}
                        onChange={(e) =>
                          patchSegment(segment.id, {
                            matchedPanelistId: e.target.value || null,
                          })
                        }
                        disabled={busy}
                        className="input"
                      >
                        <option value="">— None —</option>
                        {panelists.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end gap-2">
                      <button
                        onClick={() => patchSegment(segment.id, { status: "approved" })}
                        disabled={busy || segment.status === "approved"}
                        className="flex-1 px-3 py-2 text-xs font-medium text-white bg-green-700 rounded-lg hover:bg-green-800 disabled:opacity-50 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => patchSegment(segment.id, { status: "rejected" })}
                        disabled={busy || segment.status === "rejected"}
                        className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  <textarea
                    ref={(el) => {
                      textareaRefs.current[segment.id] = el;
                    }}
                    defaultValue={segment.text}
                    rows={4}
                    className="input font-mono text-xs mb-2"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSplit(segment)}
                      disabled={busy}
                      className="text-xs text-gray-500 hover:text-gray-900 disabled:opacity-50"
                    >
                      Split at cursor
                    </button>
                    {next && (
                      <button
                        onClick={() => handleMergeWithNext(segment, next)}
                        disabled={busy}
                        className="text-xs text-gray-500 hover:text-gray-900 disabled:opacity-50"
                      >
                        Merge with next ↓
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
