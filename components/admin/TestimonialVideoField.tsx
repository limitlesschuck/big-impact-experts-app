"use client";

import { useState } from "react";
import { VIDEO_TYPES, VIDEO_MAX_BYTES } from "@/lib/uploadRules";

// Same upload-or-paste-URL pattern as the panelist "Video clip" field in
// the episode editor, generalized to a single standalone slot (no
// panelist id to key state off of) and pointed at the "testimonials" R2
// folder instead of "panelist-clips".
export default function TestimonialVideoField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [urlMode, setUrlMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError("");

    if (!VIDEO_TYPES.includes(file.type)) {
      setError("Only MP4 or WebM video files are allowed (export .mov clips as MP4 first)");
      return;
    }
    if (file.size > VIDEO_MAX_BYTES) {
      setError(`Video is too large (max ${Math.round(VIDEO_MAX_BYTES / (1024 * 1024))}MB)`);
      return;
    }

    setUploading(true);

    const presignRes = await fetch("/api/admin/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        fileSize: file.size,
        folder: "testimonials",
      }),
    });
    const presignData = await presignRes.json();

    if (!presignRes.ok) {
      setError(presignData.error ?? "Failed to prepare upload");
      setUploading(false);
      return;
    }

    try {
      const putRes = await fetch(presignData.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error(`Storage responded with ${putRes.status}`);
      onChange(presignData.publicUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Direct upload to storage failed";
      setError(`Direct upload to storage failed — ${message}`);
    }
    setUploading(false);
  }

  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1.5">{label}</label>
      <video src={value} controls className="w-full max-w-[180px] rounded-lg border border-gray-200 mb-2" />
      <div className="flex gap-1 mb-2">
        <button
          type="button"
          onClick={() => setUrlMode(false)}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            !urlMode
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Upload
        </button>
        <button
          type="button"
          onClick={() => setUrlMode(true)}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            urlMode
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Paste URL
        </button>
      </div>

      {urlMode ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://.../clip.mp4"
          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg"
        />
      ) : (
        <label className="flex items-center justify-center w-full h-14 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-navy transition-colors">
          <p className="text-xs font-medium text-gray-600">
            {uploading ? "Uploading..." : "Click to replace video"}
          </p>
          <input
            type="file"
            accept="video/mp4,video/webm"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
