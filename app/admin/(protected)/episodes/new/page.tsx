"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PanelistForm {
  name: string;
  titleByline: string;
  titleAreaOfExpertise: string;
  bio: string;
  headshotUrl: string;
  email: string;
  freeGiftTitle: string;
  freeGiftDescription: string;
  freeGiftUrl: string;
  vipGiftTitle: string;
  vipGiftDescription: string;
  vipGiftUrl: string;
}

const emptyPanelist = (): PanelistForm => ({
  name: "",
  titleByline: "",
  titleAreaOfExpertise: "",
  bio: "",
  headshotUrl: "",
  email: "",
  freeGiftTitle: "",
  freeGiftDescription: "",
  freeGiftUrl: "",
  vipGiftTitle: "",
  vipGiftDescription: "",
  vipGiftUrl: "",
});

const MAX_PANELISTS = 5;

export default function NewEventPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [importWarning, setImportWarning] = useState<string | null>(null);

  const [form, setForm] = useState({
    titleOriginal: "",
    eventDate: "",
    hostName: "Chuck Anderson",
    recordingUrl: "",
  });

  const [panelists, setPanelists] = useState<PanelistForm[]>([emptyPanelist()]);

  function updatePanelist(index: number, patch: Partial<PanelistForm>) {
    setPanelists((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addPanelist() {
    setPanelists((rows) => (rows.length < MAX_PANELISTS ? [...rows, emptyPanelist()] : rows));
  }

  function removePanelist(index: number) {
    setPanelists((rows) => rows.filter((_, i) => i !== index));
  }

  async function handleCsvImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImporting(true);
    setMessage(null);
    setImportWarning(null);

    const text = await file.text();
    const res = await fetch("/api/admin/episodes/import-csv", {
      method: "POST",
      headers: { "Content-Type": "text/csv" },
      body: text,
    });
    const data = await res.json();

    if (!res.ok) {
      setMessage({ type: "error", text: data.error ?? "Failed to import CSV" });
      setImporting(false);
      return;
    }

    setPanelists(
      data.panelists.map((p: PanelistForm) => ({ ...emptyPanelist(), ...p }))
    );
    if (data.skippedRows?.length > 0) {
      setImportWarning(`Skipped: ${data.skippedRows.join(", ")}`);
    }
    setImporting(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/episodes/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        panelists: panelists.filter((p) => p.name.trim()),
      }),
    });
    const data = await res.json();
    if (res.ok && data.id) {
      router.push(`/admin/episodes/${data.id}`);
    } else {
      setMessage({ type: "error", text: data.error ?? "Failed to create event" });
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/episodes" className="text-sm text-gray-500 hover:text-gray-900">
          ← Events
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium">New event</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Create new event</h1>
        <p className="text-sm text-gray-500">
          Import panelist details from the Collab Pilot CSV export, or fill the
          form in manually below.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Import from Collab Pilot</h2>
        <p className="text-xs text-gray-500 mb-3">
          Upload the per-event CSV export. Rows pre-fill the panelist fields
          below — review and edit before creating the event.
        </p>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleCsvImport}
          disabled={importing}
          className="text-sm"
        />
        {importing && <p className="text-xs text-gray-500 mt-2">Importing…</p>}
        {importWarning && (
          <p className="text-xs text-amber-600 mt-2">{importWarning}</p>
        )}
      </div>

      {message && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Event details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Event title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.titleOriginal}
                onChange={(e) => setForm((f) => ({ ...f, titleOriginal: e.target.value }))}
                className="input"
                placeholder="e.g. July Collab Pilot Panel"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Event date & time <span className="text-red-400">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.eventDate}
                onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Host name</label>
              <input
                type="text"
                value={form.hostName}
                onChange={(e) => setForm((f) => ({ ...f, hostName: e.target.value }))}
                className="input"
                placeholder="Excluded from panelist transcript attribution"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Vimeo replay URL</label>
              <input
                type="text"
                value={form.recordingUrl}
                onChange={(e) => setForm((f) => ({ ...f, recordingUrl: e.target.value }))}
                className="input"
                placeholder="https://vimeo.com/123456789"
              />
            </div>
          </div>
        </div>

        {/* Panelists */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Panelists ({panelists.length}/{MAX_PANELISTS})
            </h2>
            {panelists.length < MAX_PANELISTS && (
              <button
                type="button"
                onClick={addPanelist}
                className="text-xs font-medium text-brand-purple hover:underline"
              >
                + Add panelist
              </button>
            )}
          </div>

          <div className="space-y-6">
            {panelists.map((p, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-700">Panelist {i + 1}</p>
                  {panelists.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePanelist(i)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => updatePanelist(i, { name: e.target.value })}
                    className="input"
                    placeholder="Name"
                  />
                  <input
                    type="email"
                    value={p.email}
                    onChange={(e) => updatePanelist(i, { email: e.target.value })}
                    className="input"
                    placeholder="Email"
                  />
                  <input
                    type="text"
                    value={p.titleByline}
                    onChange={(e) => updatePanelist(i, { titleByline: e.target.value })}
                    className="input"
                    placeholder="Byline"
                  />
                  <input
                    type="text"
                    value={p.titleAreaOfExpertise}
                    onChange={(e) => updatePanelist(i, { titleAreaOfExpertise: e.target.value })}
                    className="input"
                    placeholder="Area of expertise"
                  />
                  <input
                    type="text"
                    value={p.headshotUrl}
                    onChange={(e) => updatePanelist(i, { headshotUrl: e.target.value })}
                    className="input sm:col-span-2"
                    placeholder="Headshot URL"
                  />
                  <textarea
                    value={p.bio}
                    onChange={(e) => updatePanelist(i, { bio: e.target.value })}
                    className="input sm:col-span-2"
                    rows={3}
                    placeholder="Bio"
                  />
                  <input
                    type="text"
                    value={p.freeGiftTitle}
                    onChange={(e) => updatePanelist(i, { freeGiftTitle: e.target.value })}
                    className="input"
                    placeholder="Free gift title"
                  />
                  <input
                    type="text"
                    value={p.freeGiftUrl}
                    onChange={(e) => updatePanelist(i, { freeGiftUrl: e.target.value })}
                    className="input"
                    placeholder="Free gift URL"
                  />
                  <textarea
                    value={p.freeGiftDescription}
                    onChange={(e) => updatePanelist(i, { freeGiftDescription: e.target.value })}
                    className="input sm:col-span-2"
                    rows={2}
                    placeholder="Free gift description"
                  />
                  <input
                    type="text"
                    value={p.vipGiftTitle}
                    onChange={(e) => updatePanelist(i, { vipGiftTitle: e.target.value })}
                    className="input"
                    placeholder="VIP gift title (often arrives late)"
                  />
                  <input
                    type="text"
                    value={p.vipGiftUrl}
                    onChange={(e) => updatePanelist(i, { vipGiftUrl: e.target.value })}
                    className="input"
                    placeholder="VIP gift URL"
                  />
                  <textarea
                    value={p.vipGiftDescription}
                    onChange={(e) => updatePanelist(i, { vipGiftDescription: e.target.value })}
                    className="input sm:col-span-2"
                    rows={2}
                    placeholder="VIP gift description"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !form.titleOriginal || !form.eventDate}
          className="w-full px-4 py-3 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {saving ? "Creating event..." : "Create event"}
        </button>
      </form>
    </div>
  );
}
