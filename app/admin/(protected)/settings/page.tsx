"use client";

import { useEffect, useState } from "react";

type DataTool = "slugs" | "numbers" | "import" | null;

const TOOL_WARNINGS: Record<Exclude<DataTool, null>, { title: string; body: string; confirmLabel: string }> = {
  slugs: {
    title: "Generate slugs for all episodes?",
    body: "This will overwrite the existing slug on any episode whose slug was auto-generated, which can change live public URLs. Episodes with a manually-edited slug are skipped.",
    confirmLabel: "Yes, generate slugs",
  },
  numbers: {
    title: "Sync episode numbers from Captivate?",
    body: "This will overwrite the episode number field on episodes that already have one set, based on Captivate's published order. This can renumber episodes you've manually adjusted.",
    confirmLabel: "Yes, sync episode numbers",
  },
  import: {
    title: "Import new episodes from Captivate?",
    body: "This will only add new episodes. Existing episode data including titles, descriptions, and all customised content will not be changed.",
    confirmLabel: "Yes, import new episodes",
  },
};

export default function SettingsPage() {
  const [episodeCardImage, setEpisodeCardImage] = useState<"youtube_thumbnail" | "cover_art">("youtube_thumbnail");
  const [episodeGuideEnabled, setEpisodeGuideEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [dataToolsOpen, setDataToolsOpen] = useState(false);
  const [confirmTool, setConfirmTool] = useState<DataTool>(null);
  const [generatingSlugs, setGeneratingSlugs] = useState(false);
  const [syncingNumbers, setSyncingNumbers] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [toolResult, setToolResult] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/site-config")
      .then((r) => r.json())
      .then((data) => {
        if (data.episodeCardImage) setEpisodeCardImage(data.episodeCardImage);
        if (data.episodeGuideEnabled !== undefined) setEpisodeGuideEnabled(data.episodeGuideEnabled);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/site-config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ episodeCardImage, episodeGuideEnabled }),
    });
    if (res.ok) {
      setMessage({ type: "success", text: "Settings saved" });
    } else {
      const err = await res.text();
      console.error("Save failed:", err);
      setMessage({ type: "error", text: "Save failed — check console for details" });
    }
    setSaving(false);
  }

  async function handleGenerateSlugs() {
    setConfirmTool(null);
    setGeneratingSlugs(true);
    setToolResult(null);
    try {
      const res = await fetch("/api/admin/episodes/generate-slugs", { method: "POST" });
      const data = await res.json();
      setToolResult(data.message ?? "Slugs generated");
    } catch {
      setToolResult("Error: slug generation failed");
    }
    setGeneratingSlugs(false);
  }

  async function handleSyncNumbers() {
    setConfirmTool(null);
    setSyncingNumbers(true);
    setToolResult(null);
    try {
      const res = await fetch("/api/admin/episodes/sync-numbers", { method: "POST" });
      const data = await res.json();
      setToolResult(data.message ?? "Sync complete");
    } catch {
      setToolResult("Error: sync failed");
    }
    setSyncingNumbers(false);
  }

  async function handleIngest() {
    setConfirmTool(null);
    setIngesting(true);
    setToolResult(null);
    try {
      const res = await fetch("/api/admin/episodes/ingest", { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setToolResult(`Error: ${data.error}`);
      } else {
        setToolResult(`Done — ${data.created} new episodes imported, ${data.skipped} already existed`);
      }
    } catch {
      setToolResult("Error: Failed to connect to Captivate");
    }
    setIngesting(false);
  }

  function runConfirmedTool() {
    if (confirmTool === "slugs") handleGenerateSlugs();
    else if (confirmTool === "numbers") handleSyncNumbers();
    else if (confirmTool === "import") handleIngest();
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Global site configuration.</p>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Episode card image</h2>
        <p className="text-xs text-gray-500 mb-4">
          Choose which image to display on episode cards across the site.
        </p>
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setEpisodeCardImage("youtube_thumbnail")}
            className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium text-left transition-colors ${episodeCardImage === "youtube_thumbnail" ? "border-brand-purple bg-purple-50 text-brand-purple" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
          >
            YouTube thumbnail
            <p className="text-xs font-normal text-gray-500 mt-0.5">16:9 widescreen, fills the card</p>
          </button>
          <button
            onClick={() => setEpisodeCardImage("cover_art")}
            className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium text-left transition-colors ${episodeCardImage === "cover_art" ? "border-brand-purple bg-purple-50 text-brand-purple" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
          >
            Episode cover art
            <p className="text-xs font-normal text-gray-500 mt-0.5">Square artwork, shown in full</p>
          </button>
        </div>
        <div className="border-t border-gray-100 pt-6 mt-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Episode guide</h2>
          <p className="text-xs text-gray-500 mb-4">
            When enabled, Claude generates a downloadable PDF guide for each episode. Visitors enter their email to download.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEpisodeGuideEnabled(!episodeGuideEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${episodeGuideEnabled ? "bg-brand-purple" : "bg-gray-300"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${episodeGuideEnabled ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span className="text-sm text-gray-700">
              {episodeGuideEnabled ? "Episode guides enabled" : "Episode guides disabled"}
            </span>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 mt-6 overflow-hidden">
        <button
          type="button"
          onClick={() => setDataToolsOpen((o) => !o)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Data tools</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Bulk operations on episode data — use with caution
            </p>
          </div>
          <span className={`text-gray-400 transition-transform ${dataToolsOpen ? "rotate-180" : ""}`}>
            ▾
          </span>
        </button>

        {dataToolsOpen && (
          <div className="px-6 pb-6 border-t border-gray-100 pt-4 space-y-3">
            {confirmTool && (
              <div className="px-4 py-4 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-sm font-medium text-amber-900 mb-1">
                  {TOOL_WARNINGS[confirmTool].title}
                </p>
                <p className="text-xs text-amber-700 mb-3">
                  {TOOL_WARNINGS[confirmTool].body}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={runConfirmedTool}
                    className="px-4 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    {TOOL_WARNINGS[confirmTool].confirmLabel}
                  </button>
                  <button
                    onClick={() => setConfirmTool(null)}
                    className="px-4 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {toolResult && (
              <div className="px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700">
                {toolResult}
              </div>
            )}

            <button
              onClick={() => setConfirmTool("slugs")}
              disabled={generatingSlugs}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {generatingSlugs ? "Generating..." : "Generate slugs"}
            </button>
            <button
              onClick={() => setConfirmTool("numbers")}
              disabled={syncingNumbers}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {syncingNumbers ? "Syncing..." : "Sync episode numbers"}
            </button>
            <button
              onClick={() => setConfirmTool("import")}
              disabled={ingesting}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {ingesting ? "Importing..." : "Import from Captivate"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
