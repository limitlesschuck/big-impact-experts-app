"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Episode {
  id: string;
  titleOriginal: string;
  titleYoutube: string | null;
  titlePodcast: string | null;
  descriptionOriginal: string | null;
  descriptionYoutube: string | null;
  descriptionWebsite: string | null;
  guestName: string | null;
  guestBio: string | null;
  guestEmail: string | null;
  affiliateLink: string | null;
  swipeCopy: string | null;
  systemeContactId: string | null;
  episodeNumber: number | null;
  crisisCategory: string | null;
  tags: string[];
  publishStatus: string;
  audioUrl: string | null;
  thumbnailUrl: string | null;
  youtubeId: string | null;
  mp4Url: string | null;
  coverArtUrl: string | null;
  youtubeThumbnailUrl: string | null;
  captivatePublishedAt: string | null;
  slug: string | null;
  captivateId: string | null;
}

const STATUSES = ["draft", "ai_generated", "approved", "published"];

interface CategoryOption {
  value: string;
  label: string;
}

export default function EpisodeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [resyncing, setResyncing] = useState(false);
  const [uploadingArt, setUploadingArt] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [generatingGuide, setGeneratingGuide] = useState(false);
  const [guideStatus, setGuideStatus] = useState("");
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [slugEditing, setSlugEditing] = useState(false);

  const [form, setForm] = useState({
    titleYoutube: "",
    titlePodcast: "",
    descriptionYoutube: "",
    descriptionWebsite: "",
    guestName: "",
    guestBio: "",
    crisisCategory: "",
    tags: "",
    publishStatus: "draft",
    youtubeId: "",
    mp4Url: "",
    coverArtUrl: "",
    youtubeThumbnailUrl: "",
    guestEmail: "",
    affiliateLink: "",
    swipeCopy: "",
    systemeContactId: "",
    slug: "",
    captivateId: "",
    guideBio: "",
    guideFrameworks: "",
    guideTakeaways: "",
    guideQuotes: "",
    guideActionItems: "",
    guidePdfUrl: "",
  });

  async function loadEpisode() {
    const res = await fetch(`/api/admin/episodes/${id}`);
    const data = await res.json();
    setEpisode(data);
    setForm({
      titleYoutube: data.titleYoutube ?? "",
      titlePodcast: data.titlePodcast ?? "",
      descriptionYoutube: data.descriptionYoutube ?? "",
      descriptionWebsite: data.descriptionWebsite ?? "",
      guestName: data.guestName ?? "",
      guestBio: data.guestBio ?? "",
      crisisCategory: data.crisisCategory ?? "",
      tags: (data.tags ?? []).join(", "),
      publishStatus: data.publishStatus ?? "draft",
      youtubeId: data.youtubeId ?? "",
      mp4Url: data.mp4Url ?? "",
      coverArtUrl: data.coverArtUrl ?? "",
      youtubeThumbnailUrl: data.youtubeThumbnailUrl ?? "",
      guestEmail: data.guestEmail ?? "",
      affiliateLink: data.affiliateLink ?? "",
      swipeCopy: data.swipeCopy ?? "",
      systemeContactId: data.systemeContactId ?? "",
      slug: data.slug ?? "",
      captivateId: data.captivateId ?? "",
      guideBio: data.guideBio ?? "",
      guideFrameworks: data.guideFrameworks ?? "",
      guideTakeaways: data.guideTakeaways ?? "",
      guideQuotes: data.guideQuotes ?? "",
      guideActionItems: data.guideActionItems ?? "",
      guidePdfUrl: data.guidePdfUrl ?? "",
    });
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/admin/episodes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    });
    if (res.ok) {
      setMessage({ type: "success", text: "Saved successfully" });
      loadEpisode();
    } else {
      setMessage({ type: "error", text: "Save failed" });
    }
    setSaving(false);
  }

  async function handleGeneratePdf() {
    setGeneratingPdf(true);
    setMessage(null);
    const res = await fetch(
      `/api/admin/episodes/${id}/generate-pdf`,
      { method: "POST" }
    );
    const data = await res.json();
    if (res.ok && data.pdfUrl) {
      setForm((f) => ({ ...f, guidePdfUrl: data.pdfUrl }));
      setMessage({ type: "success", text: "PDF generated and stored — ready for download" });
    } else {
      setMessage({ type: "error", text: data.error ?? "PDF generation failed" });
    }
    setGeneratingPdf(false);
  }

  async function handleGenerateGuide() {
    setGeneratingGuide(true);
    setMessage(null);

    const steps = [
      "Reading transcript...",
      "Researching guest background...",
      "Extracting key frameworks...",
      "Identifying top takeaways...",
      "Pulling memorable quotes...",
      "Building action items...",
      "Finalising guide content...",
    ];
    let stepIndex = 0;
    setGuideStatus(steps[0]);

    const interval = setInterval(() => {
      stepIndex = Math.min(stepIndex + 1, steps.length - 1);
      setGuideStatus(steps[stepIndex]);
    }, 4000);

    const res = await fetch(
      `/api/admin/episodes/${id}/generate-guide`,
      { method: "POST" }
    );

    clearInterval(interval);
    setGuideStatus("");

    const data = await res.json();
    if (res.ok && data.generated) {
      setForm((f) => ({
        ...f,
        guideBio: data.generated.guestBio ?? "",
        guideFrameworks: data.generated.frameworks ?? "",
        guideTakeaways: data.generated.takeaways ?? "",
        guideQuotes: data.generated.quotes ?? "",
        guideActionItems: data.generated.actionItems ?? "",
        guidePdfUrl: "",
      }));
      setMessage({ type: "success", text: "Episode guide generated — review and save" });
    } else {
      setMessage({ type: "error", text: data.error ?? "Guide generation failed" });
    }
    setGeneratingGuide(false);
  }

  async function handleResync() {
    setResyncing(true);
    setMessage(null);
    const res = await fetch(
      `/api/admin/episodes/${id}/resync`,
      { method: "POST" }
    );
    const data = await res.json();
    setMessage({
      type: data.success ? "success" : "error",
      text: data.message ?? data.error ?? "Resync failed",
    });
    if (data.success) loadEpisode();
    setResyncing(false);
  }

  async function saveField(field: string, value: string) {
    await fetch(`/api/admin/episodes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
  }

  async function handleCoverArtUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingArt(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "episode-art");
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    if (res.ok) {
      setForm((f) => ({ ...f, coverArtUrl: data.url }));
      await saveField("coverArtUrl", data.url);
      setMessage({ type: "success", text: "Cover art uploaded and saved" });
    } else {
      setMessage({ type: "error", text: data.error ?? "Upload failed" });
    }
    setUploadingArt(false);
  }

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "episode-thumbnails");
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    if (res.ok) {
      setForm((f) => ({ ...f, youtubeThumbnailUrl: data.url }));
      await saveField("youtubeThumbnailUrl", data.url);
      setMessage({ type: "success", text: "YouTube thumbnail uploaded and saved" });
    } else {
      setMessage({ type: "error", text: data.error ?? "Upload failed" });
    }
    setUploadingThumb(false);
  }

  async function handleSendToMake() {
    setTesting(true);
    setMessage(null);
    const res = await fetch(
      `/api/admin/episodes/${id}/publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish: false }),
      }
    );
    const data = await res.json();
    setMessage({
      type: data.success ? "success" : "error",
      text: data.message,
    });
    setTesting(false);
  }

  async function handlePublish() {
    setPublishing(true);
    setMessage(null);
    const res = await fetch(
      `/api/admin/episodes/${id}/publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish: true }),
      }
    );
    const data = await res.json();
    if (res.ok && data.success) {
      setMessage({ type: "success", text: data.message });
      loadEpisode();
    } else if (res.status === 400) {
      setMessage({
        type: "error",
        text: "Episode must be set to approved before publishing",
      });
    } else {
      setMessage({
        type: "error",
        text: data.message ?? "Publish failed",
      });
    }
    setPublishing(false);
  }

  async function handleGenerate() {
    setGenerating(true);
    setMessage(null);
    const res = await fetch(`/api/admin/episodes/${id}/generate`, {
      method: "POST",
    });
    const data = await res.json();
    if (res.ok) {
      setMessage({
        type: "success",
        text: "AI content generated — review and save below",
      });
      loadEpisode();
    } else {
      setMessage({ type: "error", text: `Generation failed: ${data.error}` });
    }
    setGenerating(false);
  }

  useEffect(() => {
    loadEpisode();
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories ?? []));
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-sm text-gray-500">Loading episode...</div>
    );
  }

  if (!episode) {
    return <div className="p-8 text-sm text-gray-500">Episode not found.</div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/episodes"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Episodes
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium line-clamp-1">
          {episode.titleOriginal}
        </span>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <CollapsibleSection title="Original content (read only)" defaultOpen={false}>
            <Field label="Original title">
              <p className="text-sm text-gray-700">{episode.titleOriginal}</p>
            </Field>
            {episode.descriptionOriginal && (
              <Field label="Original description">
                <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-6">
                  {episode.descriptionOriginal}
                </p>
              </Field>
            )}
          </CollapsibleSection>

          <CollapsibleSection title="AI-generated content" defaultOpen={true}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-500">
                Generate or regenerate content using Claude AI
              </p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {generating ? "Generating..." : "Generate with Claude"}
              </button>
            </div>

            <Field label="YouTube title">
              <input
                type="text"
                value={form.titleYoutube}
                onChange={(e) =>
                  setForm((f) => ({ ...f, titleYoutube: e.target.value }))
                }
                className="input"
                placeholder="AI-generated YouTube title"
              />
              <p className="text-xs text-gray-400 mt-1">
                {form.titleYoutube.length}/70 chars
              </p>
            </Field>

            <Field label="Podcast title">
              <input
                type="text"
                value={form.titlePodcast}
                onChange={(e) =>
                  setForm((f) => ({ ...f, titlePodcast: e.target.value }))
                }
                className="input"
                placeholder="AI-generated podcast title"
              />
            </Field>

            <Field label="YouTube description">
              <textarea
                value={form.descriptionYoutube}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    descriptionYoutube: e.target.value,
                  }))
                }
                rows={8}
                className="input"
                placeholder="AI-generated YouTube description"
              />
            </Field>

            <Field label="Website / SEO description">
              <textarea
                value={form.descriptionWebsite}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    descriptionWebsite: e.target.value,
                  }))
                }
                rows={5}
                className="input"
                placeholder="AI-generated SEO description"
              />
            </Field>

            <Field label="Tags (comma separated)">
              <input
                type="text"
                value={form.tags}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tags: e.target.value }))
                }
                className="input"
                placeholder="grief recovery, starting over, rebuilding your life"
              />
            </Field>
          </CollapsibleSection>

          {/* Episode Guide */}
          <CollapsibleSection
            title="Episode guide"
            subtitle="Generate guide content from the transcript, then create the downloadable PDF"
            defaultOpen={Boolean(form.guideBio || form.guideFrameworks || form.guideTakeaways)}
          >
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <button
                type="button"
                onClick={handleGenerateGuide}
                disabled={generatingGuide}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {generatingGuide ? "Generating..." : "Generate episode guide"}
              </button>
              <button
                type="button"
                onClick={handleGeneratePdf}
                disabled={generatingPdf || !form.guideBio}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {generatingPdf ? "Generating PDF..." : "Generate PDF"}
              </button>
            </div>

            {generatingGuide && guideStatus && (
              <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-100 rounded-lg">
                <div className="w-3 h-3 rounded-full border-2 border-brand-purple border-t-transparent animate-spin flex-shrink-0" />
                <p className="text-xs text-brand-purple font-medium">{guideStatus}</p>
              </div>
            )}

            {form.guidePdfUrl && (
              <a
                href={form.guidePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-4 py-2 text-sm font-medium text-brand-purple border border-brand-purple rounded-lg hover:bg-purple-50 transition-colors"
              >
                View PDF →
              </a>
            )}

            <Field label="Guest bio">
              <textarea
                value={form.guideBio}
                onChange={(e) => setForm((f) => ({ ...f, guideBio: e.target.value }))}
                rows={6}
                className="input"
                placeholder="Guest bio for the episode guide"
              />
            </Field>
            <Field label="Key frameworks">
              <textarea
                value={form.guideFrameworks}
                onChange={(e) => setForm((f) => ({ ...f, guideFrameworks: e.target.value }))}
                rows={12}
                className="input"
                placeholder="Frameworks and methodologies from this episode"
              />
            </Field>
            <Field label="Key takeaways">
              <textarea
                value={form.guideTakeaways}
                onChange={(e) => setForm((f) => ({ ...f, guideTakeaways: e.target.value }))}
                rows={10}
                className="input"
                placeholder="Top insights and lessons"
              />
            </Field>
            <Field label="Memorable quotes">
              <textarea
                value={form.guideQuotes}
                onChange={(e) => setForm((f) => ({ ...f, guideQuotes: e.target.value }))}
                rows={8}
                className="input"
                placeholder="Direct quotes from the guest"
              />
            </Field>
            <Field label="Action items">
              <textarea
                value={form.guideActionItems}
                onChange={(e) => setForm((f) => ({ ...f, guideActionItems: e.target.value }))}
                rows={10}
                className="input"
                placeholder="Practical checklist for listeners"
              />
            </Field>
          </CollapsibleSection>

          <CollapsibleSection title="Guest details" defaultOpen={false}>
            <Field label="Guest name">
              <input
                type="text"
                value={form.guestName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, guestName: e.target.value }))
                }
                className="input"
              />
            </Field>
            <Field label="Guest email">
              <input
                type="email"
                value={form.guestEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, guestEmail: e.target.value }))
                }
                className="input"
                placeholder="guest@example.com"
              />
            </Field>
            <Field label="Guest bio">
              <textarea
                value={form.guestBio}
                onChange={(e) =>
                  setForm((f) => ({ ...f, guestBio: e.target.value }))
                }
                rows={3}
                className="input"
                placeholder="Short bio shown on episode page"
              />
            </Field>
            <Field label="Affiliate link">
              <input
                type="text"
                value={form.affiliateLink}
                onChange={(e) =>
                  setForm((f) => ({ ...f, affiliateLink: e.target.value }))
                }
                className="input"
                placeholder="https://..."
              />
            </Field>
            <Field label="Swipe copy URL">
              <input
                type="url"
                value={form.swipeCopy}
                onChange={(e) =>
                  setForm((f) => ({ ...f, swipeCopy: e.target.value }))
                }
                className="input"
                placeholder="https://..."
              />
            </Field>
            <Field label="Systeme.io contact ID">
              <input
                type="text"
                value={form.systemeContactId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, systemeContactId: e.target.value }))
                }
                className="input"
                placeholder="Systeme.io contact ID"
              />
            </Field>
          </CollapsibleSection>
        </div>

        <div className="space-y-6">
          <CollapsibleSection title="Publishing" defaultOpen={true}>
            <Field label="Crisis category">
              <select
                value={form.crisisCategory}
                onChange={(e) =>
                  setForm((f) => ({ ...f, crisisCategory: e.target.value }))
                }
                className="input"
              >
                <option value="">— Select category —</option>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Publish status">
              <select
                value={form.publishStatus}
                onChange={(e) =>
                  setForm((f) => ({ ...f, publishStatus: e.target.value }))
                }
                className="input"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Public URL">
              {slugEditing ? (
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-gray-400 shrink-0">…/episodes/</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, slug: e.target.value }))
                    }
                    className="input flex-1"
                    placeholder="episode-slug"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setSlugEditing(false)}
                    className="text-xs text-gray-500 hover:text-gray-900 shrink-0"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {form.slug ? (
                    <a
                      href={`https://limitlesslivingpodcast.com/episodes/${form.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-purple hover:underline truncate"
                    >
                      limitlesslivingpodcast.com/episodes/{form.slug}
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">No slug set</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setSlugEditing(true)}
                    className="text-xs text-gray-400 hover:text-gray-700 shrink-0 underline"
                  >
                    Edit
                  </button>
                </div>
              )}
            </Field>

            <Field label="Captivate ID">
              <input
                type="text"
                value={form.captivateId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, captivateId: e.target.value }))
                }
                className="input"
                placeholder="Paste from Captivate episode editor URL"
              />
              <p className="text-xs text-gray-400 mt-1">
                Found in Captivate as the episode slug e.g. 0f6aa6a5-d1cb-4b66-86bd-9987f951da69
              </p>
            </Field>
          </CollapsibleSection>

          <CollapsibleSection title="Media" defaultOpen={false}>
            <Field label="YouTube video ID">
              <input
                type="text"
                value={form.youtubeId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, youtubeId: e.target.value }))
                }
                className="input"
                placeholder="e.g. dQw4w9WgXcQ"
              />
            </Field>

            <Field label="MP4 URL (Google Drive)">
              <input
                type="text"
                value={form.mp4Url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, mp4Url: e.target.value }))
                }
                className="input"
                placeholder="Paste Google Drive MP4 link"
              />
              {episode.episodeNumber && episode.guestName && (
                <p className="text-xs text-gray-400 mt-1">
                  Expected folder: LLS-{String(episode.episodeNumber).padStart(3, "0")} {episode.guestName}
                </p>
              )}
            </Field>

            <Field label="Cover art">
              {form.coverArtUrl ? (
                <div>
                  <img
                    src={form.coverArtUrl}
                    alt="Cover art"
                    className="w-full rounded-lg border border-gray-200 mb-2"
                  />
                  <input
                    type="text"
                    value={form.coverArtUrl}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, coverArtUrl: e.target.value }))
                    }
                    className="input text-xs"
                  />
                </div>
              ) : (
                <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-purple transition-colors">
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-600">
                      {uploadingArt ? "Uploading..." : "Click to upload cover art"}
                    </p>
                    <p className="text-xs text-gray-400">JPG, PNG, WebP</p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCoverArtUpload}
                    className="hidden"
                    disabled={uploadingArt}
                  />
                </label>
              )}
            </Field>

            <Field label="YouTube thumbnail">
              {form.youtubeThumbnailUrl ? (
                <div>
                  <img
                    src={form.youtubeThumbnailUrl}
                    alt="YouTube thumbnail"
                    className="w-full rounded-lg border border-gray-200 mb-2"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, youtubeThumbnailUrl: "" }))}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-purple transition-colors">
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-600">
                      {uploadingThumb ? "Uploading..." : "Click to upload YouTube thumbnail"}
                    </p>
                    <p className="text-xs text-gray-400">JPG, PNG, WebP — 16:9 ratio</p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                    disabled={uploadingThumb}
                  />
                </label>
              )}
            </Field>

            {episode.thumbnailUrl && (
              <Field label="Thumbnail">
                <img
                  src={episode.thumbnailUrl}
                  alt="Episode thumbnail"
                  className="w-full rounded-lg border border-gray-200"
                />
              </Field>
            )}

            {episode.audioUrl && (
              <Field label="Audio">
                <audio controls className="w-full" src={episode.audioUrl}>
                  Your browser does not support audio.
                </audio>
              </Field>
            )}
          </CollapsibleSection>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button
              onClick={() => router.push("/admin/episodes")}
              className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          <CollapsibleSection title="Sync & distribution" defaultOpen={false}>
            <button
              type="button"
              onClick={handleResync}
              disabled={resyncing}
              className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {resyncing ? "Syncing..." : "Re-sync from Captivate"}
            </button>

            <button
              type="button"
              onClick={handleSendToMake}
              disabled={testing}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {testing ? "Sending..." : "Send to Make.com"}
            </button>

            {episode.publishStatus === "approved" && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-lg hover:bg-green-800 disabled:opacity-50 transition-colors"
              >
                {publishing ? "Publishing..." : "Publish to YouTube"}
              </button>
            )}
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function CollapsibleSection({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        <span
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
