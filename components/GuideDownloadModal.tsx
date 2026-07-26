"use client";

import { useState, useEffect } from "react";

interface Props {
  episodeId: string;
  episodeTitle: string;
}

const LS_KEY = "lls_guide_email";

export default function GuideDownloadModal({ episodeId, episodeTitle: _episodeTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      fetch("/api/guide-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: saved, firstName: "", episodeId }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.pdfUrl) setPdfUrl(data.pdfUrl);
        })
        .catch(() => {});
    }
  }, [episodeId]);

  async function handleSubmit() {
    if (!email) { setError("Please enter your email."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/guide-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, episodeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      localStorage.setItem(LS_KEY, email);
      setOpen(false);
      setPdfUrl(data.pdfUrl);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (pdfUrl) {
    return (
      <a
        href={pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary w-full text-center block"
        download
      >
        ⬇ Download Episode Guide
      </a>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-primary w-full"
      >
        ⬇ Download Episode Guide
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>

            <h2 className="text-xl font-extrabold text-gray-900 mb-1">
              Get the Episode Guide
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Enter your name and email to download the free guide for this episode.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Your first name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
                />
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary w-full disabled:opacity-60"
              >
                {loading ? "Sending…" : "Get my free guide →"}
              </button>

              <p className="text-xs text-gray-400 text-center">
                No spam. Unsubscribe any time.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
