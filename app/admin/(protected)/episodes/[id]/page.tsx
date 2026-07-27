"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface ToolEntry {
  freeGiftTitle: string | null;
  freeGiftDescription: string | null;
  freeGiftUrl: string | null;
  vipGiftTitle: string | null;
  vipGiftDescription: string | null;
  vipGiftUrl: string | null;
  featured: boolean;
}

interface Panelist {
  id: string;
  name: string;
  titleByline: string | null;
  titleAreaOfExpertise: string | null;
  bio: string | null;
  shortBio: string | null;
  headshotUrl: string | null;
  email: string | null;
  affiliateLink: string | null;
  swipeCopy: string | null;
  transcriptSegment: string | null;
  guideBio: string | null;
  guideFrameworks: string | null;
  guideTakeaways: string | null;
  guideQuotes: string | null;
  guideActionItems: string | null;
  guidePdfUrl: string | null;
  toolEntry: ToolEntry | null;
}

interface Event {
  id: string;
  titleOriginal: string;
  titleYoutube: string | null;
  titlePodcast: string | null;
  descriptionOriginal: string | null;
  descriptionYoutube: string | null;
  descriptionWebsite: string | null;
  tags: string[];
  publishStatus: string;
  audioUrl: string | null;
  thumbnailUrl: string | null;
  youtubeId: string | null;
  mp4Url: string | null;
  coverArtUrl: string | null;
  youtubeThumbnailUrl: string | null;
  slug: string | null;
  eventDate: string;
  hostName: string | null;
  hostTitle: string | null;
  hostHeadshotUrl: string | null;
  hostPhotoUrl: string | null;
  recordingUrl: string | null;
  giftPublicUntil: string | null;
  hostNote: string | null;
  hostBio: string | null;
  heroSubheading: string | null;
  registrationHeading: string | null;
  registrationSubheading: string | null;
  surveyUrl: string | null;
  transcriptRaw: string | null;
  transcriptSegments: { status: string }[];
  registrations: { id: string; name: string; email: string; createdAt: string }[];
  panelists: Panelist[];
}

const STATUSES = ["draft", "ai_generated", "approved", "published"];

// Guide generation is a single blocking Claude API call with no
// real progress signal from the server -- this is a simulated
// sequence timed to typical duration (~1-3 min), not literal backend
// stage reporting. Settles on a reassuring tail message rather than
// cycling if it runs long.
const GUIDE_PROGRESS_MESSAGES = [
  "Reading transcript...",
  "Analyzing content...",
  "Generating bio...",
  "Generating frameworks & takeaways...",
  "Generating quotes & action items...",
  "Finalizing guide...",
];
const GUIDE_PROGRESS_STEP_MS = 12000;
const GUIDE_PROGRESS_TAIL_MESSAGE = "Still working — this can take a few minutes...";

function toDateInputValue(value: string | null): string {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function toDateTimeInputValue(value: string | null): string {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [uploadingArt, setUploadingArt] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingTranscript, setUploadingTranscript] = useState(false);
  const [uploadingHeadshotFor, setUploadingHeadshotFor] = useState<string | null>(null);
  const [uploadingHostHeadshot, setUploadingHostHeadshot] = useState(false);
  const [uploadingHostPhoto, setUploadingHostPhoto] = useState(false);
  const [generatingGuideFor, setGeneratingGuideFor] = useState<string | null>(null);
  const [generatingPdfFor, setGeneratingPdfFor] = useState<string | null>(null);
  const [shorteningBioFor, setShorteningBioFor] = useState<string | null>(null);
  const [guideResults, setGuideResults] = useState<
    Record<string, { type: "success" | "error"; text: string }>
  >({});
  const [pdfResults, setPdfResults] = useState<
    Record<string, { type: "success" | "error"; text: string }>
  >({});
  const [shortBioResults, setShortBioResults] = useState<
    Record<string, { type: "success" | "error"; text: string }>
  >({});
  const [guideProgressFor, setGuideProgressFor] = useState<Record<string, string>>({});
  const guideProgressTimers = useRef<Record<string, ReturnType<typeof setInterval>>>({});
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
    tags: "",
    publishStatus: "draft",
    youtubeId: "",
    mp4Url: "",
    coverArtUrl: "",
    youtubeThumbnailUrl: "",
    slug: "",
    eventDate: "",
    hostName: "",
    hostTitle: "",
    hostHeadshotUrl: "",
    hostPhotoUrl: "",
    recordingUrl: "",
    giftPublicUntil: "",
    hostNote: "",
    hostBio: "",
    heroSubheading: "",
    registrationHeading: "",
    registrationSubheading: "",
    surveyUrl: "",
    transcriptRaw: "",
  });

  const [panelistForms, setPanelistForms] = useState<Record<string, Panelist>>({});

  async function loadEvent() {
    const res = await fetch(`/api/admin/episodes/${id}`);
    const data: Event = await res.json();
    setEvent(data);
    setForm({
      titleYoutube: data.titleYoutube ?? "",
      titlePodcast: data.titlePodcast ?? "",
      descriptionYoutube: data.descriptionYoutube ?? "",
      descriptionWebsite: data.descriptionWebsite ?? "",
      tags: (data.tags ?? []).join(", "),
      publishStatus: data.publishStatus ?? "draft",
      youtubeId: data.youtubeId ?? "",
      mp4Url: data.mp4Url ?? "",
      coverArtUrl: data.coverArtUrl ?? "",
      youtubeThumbnailUrl: data.youtubeThumbnailUrl ?? "",
      slug: data.slug ?? "",
      eventDate: toDateTimeInputValue(data.eventDate),
      hostName: data.hostName ?? "",
      hostTitle: data.hostTitle ?? "",
      hostHeadshotUrl: data.hostHeadshotUrl ?? "",
      hostPhotoUrl: data.hostPhotoUrl ?? "",
      recordingUrl: data.recordingUrl ?? "",
      giftPublicUntil: toDateInputValue(data.giftPublicUntil),
      hostNote: data.hostNote ?? "",
      hostBio: data.hostBio ?? "",
      heroSubheading: data.heroSubheading ?? "",
      registrationHeading: data.registrationHeading ?? "",
      registrationSubheading: data.registrationSubheading ?? "",
      surveyUrl: data.surveyUrl ?? "",
      transcriptRaw: data.transcriptRaw ?? "",
    });
    setPanelistForms(
      Object.fromEntries((data.panelists ?? []).map((p) => [p.id, p]))
    );
    setLoading(false);
  }

  function updatePanelist(panelistId: string, patch: Partial<Panelist>) {
    setPanelistForms((forms) => ({
      ...forms,
      [panelistId]: { ...forms[panelistId], ...patch },
    }));
  }

  function updateToolEntry(panelistId: string, patch: Partial<ToolEntry>) {
    setPanelistForms((forms) => ({
      ...forms,
      [panelistId]: {
        ...forms[panelistId],
        toolEntry: {
          ...(forms[panelistId].toolEntry ?? {
            freeGiftTitle: null,
            freeGiftDescription: null,
            freeGiftUrl: null,
            vipGiftTitle: null,
            vipGiftDescription: null,
            vipGiftUrl: null,
            featured: false,
          }),
          ...patch,
        },
      },
    }));
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
        panelists: Object.values(panelistForms).map((p) => ({
          id: p.id,
          name: p.name,
          titleByline: p.titleByline,
          titleAreaOfExpertise: p.titleAreaOfExpertise,
          bio: p.bio,
          shortBio: p.shortBio,
          headshotUrl: p.headshotUrl,
          email: p.email,
          affiliateLink: p.affiliateLink,
          swipeCopy: p.swipeCopy,
          guideBio: p.guideBio,
          guideFrameworks: p.guideFrameworks,
          guideTakeaways: p.guideTakeaways,
          guideQuotes: p.guideQuotes,
          guideActionItems: p.guideActionItems,
          guidePdfUrl: p.guidePdfUrl,
          toolEntry: p.toolEntry ?? undefined,
        })),
      }),
    });
    if (res.ok) {
      setMessage({ type: "success", text: "Saved successfully" });
      loadEvent();
    } else {
      setMessage({ type: "error", text: "Save failed" });
    }
    setSaving(false);
  }

  function startGuideProgress(panelistId: string) {
    let step = 0;
    setGuideProgressFor((p) => ({ ...p, [panelistId]: GUIDE_PROGRESS_MESSAGES[0] }));
    guideProgressTimers.current[panelistId] = setInterval(() => {
      step += 1;
      const nextMessage =
        step < GUIDE_PROGRESS_MESSAGES.length
          ? GUIDE_PROGRESS_MESSAGES[step]
          : GUIDE_PROGRESS_TAIL_MESSAGE;
      setGuideProgressFor((p) => ({ ...p, [panelistId]: nextMessage }));
    }, GUIDE_PROGRESS_STEP_MS);
  }

  function stopGuideProgress(panelistId: string) {
    clearInterval(guideProgressTimers.current[panelistId]);
    delete guideProgressTimers.current[panelistId];
    setGuideProgressFor((p) => {
      const { [panelistId]: _, ...rest } = p;
      return rest;
    });
  }

  useEffect(() => {
    const timers = guideProgressTimers.current;
    return () => {
      Object.values(timers).forEach(clearInterval);
    };
  }, []);

  async function handleGenerateGuide(panelistId: string) {
    setGeneratingGuideFor(panelistId);
    setGuideResults((r) => {
      const { [panelistId]: _, ...rest } = r;
      return rest;
    });
    startGuideProgress(panelistId);
    const res = await fetch(
      `/api/admin/episodes/${id}/generate-guide`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panelistId }),
      }
    );
    const data = await res.json();
    if (res.ok && data.generated) {
      updatePanelist(panelistId, {
        guideBio: data.generated.bio ?? "",
        guideFrameworks: data.generated.frameworks ?? "",
        guideTakeaways: data.generated.takeaways ?? "",
        guideQuotes: data.generated.quotes ?? "",
        guideActionItems: data.generated.actionItems ?? "",
        guidePdfUrl: "",
      });
      setGuideResults((r) => ({
        ...r,
        [panelistId]: { type: "success", text: "Guide generated — review and save" },
      }));
    } else {
      setGuideResults((r) => ({
        ...r,
        [panelistId]: { type: "error", text: data.error ?? "Guide generation failed" },
      }));
    }
    stopGuideProgress(panelistId);
    setGeneratingGuideFor(null);
  }

  async function handleShortenBio(panelistId: string) {
    setShorteningBioFor(panelistId);
    setShortBioResults((r) => {
      const { [panelistId]: _, ...rest } = r;
      return rest;
    });
    const res = await fetch(
      `/api/admin/episodes/${id}/shorten-bio`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panelistId }),
      }
    );
    const data = await res.json();
    if (res.ok && data.shortBio) {
      updatePanelist(panelistId, { shortBio: data.shortBio });
      setShortBioResults((r) => ({
        ...r,
        [panelistId]: { type: "success", text: "Short bio generated — review and save" },
      }));
    } else {
      setShortBioResults((r) => ({
        ...r,
        [panelistId]: { type: "error", text: data.error ?? "Bio shortening failed" },
      }));
    }
    setShorteningBioFor(null);
  }

  async function handleGeneratePdf(panelistId: string) {
    setGeneratingPdfFor(panelistId);
    setPdfResults((r) => {
      const { [panelistId]: _, ...rest } = r;
      return rest;
    });
    const res = await fetch(
      `/api/admin/episodes/${id}/generate-pdf`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panelistId }),
      }
    );
    const data = await res.json();
    if (res.ok && data.pdfUrl) {
      updatePanelist(panelistId, { guidePdfUrl: data.pdfUrl });
      setPdfResults((r) => ({
        ...r,
        [panelistId]: { type: "success", text: "PDF generated and stored" },
      }));
    } else {
      setPdfResults((r) => ({
        ...r,
        [panelistId]: { type: "error", text: data.error ?? "PDF generation failed" },
      }));
    }
    setGeneratingPdfFor(null);
  }

  async function handleCoverArtUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingArt(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "event-art");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) {
      setForm((f) => ({ ...f, coverArtUrl: data.url }));
      setMessage({ type: "success", text: "Cover art uploaded — save to apply" });
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
    fd.append("folder", "event-thumbnails");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) {
      setForm((f) => ({ ...f, youtubeThumbnailUrl: data.url }));
      setMessage({ type: "success", text: "Thumbnail uploaded — save to apply" });
    } else {
      setMessage({ type: "error", text: data.error ?? "Upload failed" });
    }
    setUploadingThumb(false);
  }

  async function handleHostHeadshotUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHostHeadshot(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "host-images");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) {
      setForm((f) => ({ ...f, hostHeadshotUrl: data.url }));
      setMessage({ type: "success", text: "Host headshot uploaded — save to apply" });
    } else {
      setMessage({ type: "error", text: data.error ?? "Upload failed" });
    }
    setUploadingHostHeadshot(false);
  }

  async function handleHostPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHostPhoto(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "host-images");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) {
      setForm((f) => ({ ...f, hostPhotoUrl: data.url }));
      setMessage({ type: "success", text: "Host photo uploaded — save to apply" });
    } else {
      setMessage({ type: "error", text: data.error ?? "Upload failed" });
    }
    setUploadingHostPhoto(false);
  }

  async function handleHeadshotUpload(
    panelistId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingHeadshotFor(panelistId);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "panelist-headshots");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) {
      updatePanelist(panelistId, { headshotUrl: data.url });
      setMessage({ type: "success", text: "Headshot uploaded — save to apply" });
    } else {
      setMessage({ type: "error", text: data.error ?? "Upload failed" });
    }
    setUploadingHeadshotFor(null);
  }

  async function handleTranscriptUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingTranscript(true);
    const text = await file.text();
    setForm((f) => ({ ...f, transcriptRaw: text }));
    setMessage({ type: "success", text: "Transcript loaded — save to apply" });
    setUploadingTranscript(false);
  }

  async function handleSendToMake() {
    setTesting(true);
    setMessage(null);
    const res = await fetch(`/api/admin/episodes/${id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publish: false }),
    });
    const data = await res.json();
    setMessage({ type: data.success ? "success" : "error", text: data.message });
    setTesting(false);
  }

  async function handlePublish() {
    setPublishing(true);
    setMessage(null);
    const res = await fetch(`/api/admin/episodes/${id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publish: true }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setMessage({ type: "success", text: data.message });
      loadEvent();
    } else if (res.status === 400) {
      setMessage({ type: "error", text: "Event must be set to approved before publishing" });
    } else {
      setMessage({ type: "error", text: data.message ?? "Publish failed" });
    }
    setPublishing(false);
  }

  useEffect(() => {
    loadEvent();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-sm text-gray-500">Loading event...</div>;
  }

  if (!event) {
    return <div className="p-8 text-sm text-gray-500">Event not found.</div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/episodes" className="text-sm text-gray-500 hover:text-gray-900">
          ← Events
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium line-clamp-1">
          {event.titleOriginal}
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
              <p className="text-sm text-gray-700">{event.titleOriginal}</p>
            </Field>
            {event.descriptionOriginal && (
              <Field label="Original description">
                <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-6">
                  {event.descriptionOriginal}
                </p>
              </Field>
            )}
          </CollapsibleSection>

          <CollapsibleSection title="YouTube / podcast repurposing" defaultOpen={false}>
            <Field label="YouTube title">
              <input
                type="text"
                value={form.titleYoutube}
                onChange={(e) => setForm((f) => ({ ...f, titleYoutube: e.target.value }))}
                className="input"
              />
            </Field>
            <Field label="Podcast title">
              <input
                type="text"
                value={form.titlePodcast}
                onChange={(e) => setForm((f) => ({ ...f, titlePodcast: e.target.value }))}
                className="input"
              />
            </Field>
            <Field label="YouTube description">
              <textarea
                value={form.descriptionYoutube}
                onChange={(e) => setForm((f) => ({ ...f, descriptionYoutube: e.target.value }))}
                rows={8}
                className="input"
              />
            </Field>
            <Field label="Website / SEO description">
              <textarea
                value={form.descriptionWebsite}
                onChange={(e) => setForm((f) => ({ ...f, descriptionWebsite: e.target.value }))}
                rows={5}
                className="input"
              />
            </Field>
            <Field label="Tags (comma separated)">
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                className="input"
              />
            </Field>
          </CollapsibleSection>

          <CollapsibleSection title="Transcript" defaultOpen={false}>
            <Field label="Transcript file (.vtt)">
              <label className="flex items-center justify-center w-full h-16 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-purple transition-colors">
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-600">
                    {uploadingTranscript ? "Reading file..." : "Click to upload Zoom VTT transcript"}
                  </p>
                  <p className="text-xs text-gray-400">.vtt export</p>
                </div>
                <input
                  type="file"
                  accept=".vtt,text/vtt"
                  onChange={handleTranscriptUpload}
                  className="hidden"
                  disabled={uploadingTranscript}
                />
              </label>
            </Field>
            {form.transcriptRaw && (
              <p className="text-xs text-gray-500">
                {form.transcriptRaw.length.toLocaleString()} characters loaded
              </p>
            )}
            <Field label="Raw transcript (review/edit)">
              <textarea
                value={form.transcriptRaw}
                onChange={(e) => setForm((f) => ({ ...f, transcriptRaw: e.target.value }))}
                rows={8}
                className="input font-mono text-xs"
                placeholder="No transcript uploaded yet"
              />
            </Field>
            {event.transcriptRaw && (
              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/episodes/${event.id}/transcript`}
                  className="text-sm font-medium text-brand-purple hover:underline"
                >
                  Review transcript segments →
                </Link>
                {event.transcriptSegments.length > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      event.transcriptSegments.every((s) => s.status !== "pending")
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {event.transcriptSegments.filter((s) => s.status !== "pending").length}/
                    {event.transcriptSegments.length} segments reviewed
                  </span>
                )}
              </div>
            )}
          </CollapsibleSection>

          <CollapsibleSection title="Host" defaultOpen={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Host name">
                <input
                  type="text"
                  value={form.hostName}
                  onChange={(e) => setForm((f) => ({ ...f, hostName: e.target.value }))}
                  className="input"
                />
              </Field>
              <Field label="Host title">
                <input
                  type="text"
                  value={form.hostTitle}
                  onChange={(e) => setForm((f) => ({ ...f, hostTitle: e.target.value }))}
                  className="input"
                />
              </Field>
            </div>

            <Field label="Host headshot (square, for Meet the Experts)">
              {form.hostHeadshotUrl ? (
                <div className="flex items-start gap-3">
                  <img
                    src={form.hostHeadshotUrl}
                    alt="Host headshot"
                    className="w-16 h-16 rounded-full object-cover border border-gray-200"
                  />
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={form.hostHeadshotUrl}
                      onChange={(e) => setForm((f) => ({ ...f, hostHeadshotUrl: e.target.value }))}
                      className="input text-xs"
                    />
                    <label className="inline-block text-xs text-brand-purple hover:underline cursor-pointer">
                      {uploadingHostHeadshot ? "Uploading..." : "Replace headshot"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleHostHeadshotUpload}
                        className="hidden"
                        disabled={uploadingHostHeadshot}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex items-center justify-center w-full h-16 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-purple transition-colors">
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-600">
                      {uploadingHostHeadshot ? "Uploading..." : "Click to upload headshot"}
                    </p>
                    <p className="text-xs text-gray-400">JPG, PNG, WebP</p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleHostHeadshotUpload}
                    className="hidden"
                    disabled={uploadingHostHeadshot}
                  />
                </label>
              )}
            </Field>

            <Field label="Host photo (larger portrait, for Note From Your Host)">
              {form.hostPhotoUrl ? (
                <div>
                  <img
                    src={form.hostPhotoUrl}
                    alt="Host photo"
                    className="w-full max-w-[200px] rounded-lg border border-gray-200 mb-2"
                  />
                  <input
                    type="text"
                    value={form.hostPhotoUrl}
                    onChange={(e) => setForm((f) => ({ ...f, hostPhotoUrl: e.target.value }))}
                    className="input text-xs mb-2"
                  />
                  <label className="inline-block text-xs text-brand-purple hover:underline cursor-pointer">
                    {uploadingHostPhoto ? "Uploading..." : "Replace photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleHostPhotoUpload}
                      className="hidden"
                      disabled={uploadingHostPhoto}
                    />
                  </label>
                </div>
              ) : (
                <label className="flex items-center justify-center w-full h-16 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-purple transition-colors">
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-600">
                      {uploadingHostPhoto ? "Uploading..." : "Click to upload photo"}
                    </p>
                    <p className="text-xs text-gray-400">JPG, PNG, WebP</p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleHostPhotoUpload}
                    className="hidden"
                    disabled={uploadingHostPhoto}
                  />
                </label>
              )}
            </Field>

            <Field label="Note from the host">
              <textarea
                value={form.hostNote}
                onChange={(e) => setForm((f) => ({ ...f, hostNote: e.target.value }))}
                rows={4}
                className="input"
                placeholder="Why I created this event — shown on the registration page"
              />
            </Field>

            <Field label="Host short bio (for Meet the Experts card)">
              <textarea
                value={form.hostBio}
                onChange={(e) => setForm((f) => ({ ...f, hostBio: e.target.value }))}
                rows={2}
                className="input"
                placeholder="Same length as a panelist bio"
              />
            </Field>
          </CollapsibleSection>

          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Panelists ({event.panelists.length})
            </h2>
            <div className="space-y-4">
              {event.panelists.map((p) => {
                const pf = panelistForms[p.id] ?? p;
                return (
                  <CollapsibleSection
                    key={p.id}
                    title={pf.name || "Unnamed panelist"}
                    defaultOpen={false}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Name">
                        <input
                          type="text"
                          value={pf.name}
                          onChange={(e) => updatePanelist(p.id, { name: e.target.value })}
                          className="input"
                        />
                      </Field>
                      <Field label="Email">
                        <input
                          type="email"
                          value={pf.email ?? ""}
                          onChange={(e) => updatePanelist(p.id, { email: e.target.value })}
                          className="input"
                        />
                      </Field>
                      <Field label="Byline">
                        <input
                          type="text"
                          value={pf.titleByline ?? ""}
                          onChange={(e) => updatePanelist(p.id, { titleByline: e.target.value })}
                          className="input"
                        />
                      </Field>
                      <Field label="Area of expertise">
                        <input
                          type="text"
                          value={pf.titleAreaOfExpertise ?? ""}
                          onChange={(e) =>
                            updatePanelist(p.id, { titleAreaOfExpertise: e.target.value })
                          }
                          className="input"
                        />
                      </Field>
                      <Field label="Affiliate link">
                        <input
                          type="text"
                          value={pf.affiliateLink ?? ""}
                          onChange={(e) => updatePanelist(p.id, { affiliateLink: e.target.value })}
                          className="input"
                        />
                      </Field>
                    </div>
                    <Field label="Headshot">
                      {pf.headshotUrl ? (
                        <div className="flex items-start gap-3">
                          <img
                            src={pf.headshotUrl}
                            alt={pf.name || "Headshot"}
                            className="w-16 h-16 rounded-full object-cover border border-gray-200"
                          />
                          <div className="flex-1 space-y-1">
                            <input
                              type="text"
                              value={pf.headshotUrl}
                              onChange={(e) => updatePanelist(p.id, { headshotUrl: e.target.value })}
                              className="input text-xs"
                            />
                            <label className="inline-block text-xs text-brand-purple hover:underline cursor-pointer">
                              {uploadingHeadshotFor === p.id ? "Uploading..." : "Replace headshot"}
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => handleHeadshotUpload(p.id, e)}
                                className="hidden"
                                disabled={uploadingHeadshotFor === p.id}
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center w-full h-16 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-purple transition-colors">
                          <div className="text-center">
                            <p className="text-xs font-medium text-gray-600">
                              {uploadingHeadshotFor === p.id ? "Uploading..." : "Click to upload headshot"}
                            </p>
                            <p className="text-xs text-gray-400">JPG, PNG, WebP</p>
                          </div>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => handleHeadshotUpload(p.id, e)}
                            className="hidden"
                            disabled={uploadingHeadshotFor === p.id}
                          />
                        </label>
                      )}
                    </Field>
                    <Field label="Bio">
                      <textarea
                        value={pf.bio ?? ""}
                        onChange={(e) => updatePanelist(p.id, { bio: e.target.value })}
                        rows={3}
                        className="input"
                      />
                    </Field>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-gray-500">
                          Short bio (Meet the Experts card)
                        </label>
                        <button
                          type="button"
                          onClick={() => handleShortenBio(p.id)}
                          disabled={shorteningBioFor === p.id || !pf.bio}
                          className="text-xs font-medium text-brand-purple hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1"
                        >
                          {shorteningBioFor === p.id && <Spinner />}
                          {shorteningBioFor === p.id ? "Shortening..." : "Shorten bio"}
                        </button>
                      </div>
                      <textarea
                        value={pf.shortBio ?? ""}
                        onChange={(e) => updatePanelist(p.id, { shortBio: e.target.value })}
                        rows={2}
                        className="input"
                        placeholder="AI-condensed version — falls back to the full bio on the register page until generated"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {(pf.shortBio ?? "").length} characters
                      </p>
                      {shortBioResults[p.id] && (
                        <p
                          className={`text-xs mt-1 ${shortBioResults[p.id].type === "success" ? "text-green-600" : "text-red-600"}`}
                        >
                          {shortBioResults[p.id].text}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                      <Field label="Free gift title">
                        <input
                          type="text"
                          value={pf.toolEntry?.freeGiftTitle ?? ""}
                          onChange={(e) =>
                            updateToolEntry(p.id, { freeGiftTitle: e.target.value })
                          }
                          className="input"
                        />
                      </Field>
                      <Field label="Free gift URL">
                        <input
                          type="text"
                          value={pf.toolEntry?.freeGiftUrl ?? ""}
                          onChange={(e) => updateToolEntry(p.id, { freeGiftUrl: e.target.value })}
                          className="input"
                        />
                      </Field>
                      <Field label="VIP gift title">
                        <input
                          type="text"
                          value={pf.toolEntry?.vipGiftTitle ?? ""}
                          onChange={(e) => updateToolEntry(p.id, { vipGiftTitle: e.target.value })}
                          className="input"
                        />
                      </Field>
                      <Field label="VIP gift URL">
                        <input
                          type="text"
                          value={pf.toolEntry?.vipGiftUrl ?? ""}
                          onChange={(e) => updateToolEntry(p.id, { vipGiftUrl: e.target.value })}
                          className="input"
                        />
                      </Field>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex flex-col sm:flex-row gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => handleGenerateGuide(p.id)}
                          disabled={generatingGuideFor === p.id}
                          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          <span className="flex items-center justify-center gap-2">
                            {generatingGuideFor === p.id && <Spinner />}
                            {generatingGuideFor === p.id ? "Generating..." : "Generate guide"}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGeneratePdf(p.id)}
                          disabled={generatingPdfFor === p.id || !pf.guideBio}
                          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          <span className="flex items-center justify-center gap-2">
                            {generatingPdfFor === p.id && <Spinner />}
                            {generatingPdfFor === p.id ? "Generating PDF..." : "Generate PDF"}
                          </span>
                        </button>
                      </div>
                      {guideProgressFor[p.id] && (
                        <p className="text-xs text-gray-500 mb-2 italic">
                          {guideProgressFor[p.id]}
                        </p>
                      )}
                      {guideResults[p.id] && (
                        <p
                          className={`text-xs mb-2 ${
                            guideResults[p.id].type === "success" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {guideResults[p.id].text}
                        </p>
                      )}
                      {pdfResults[p.id] && (
                        <p
                          className={`text-xs mb-2 ${
                            pdfResults[p.id].type === "success" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {pdfResults[p.id].text}
                        </p>
                      )}
                      {pf.guidePdfUrl && (
                        <a
                          href={pf.guidePdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center px-4 py-2 mb-3 text-sm font-medium text-brand-purple border border-brand-purple rounded-lg hover:bg-purple-50 transition-colors"
                        >
                          View PDF →
                        </a>
                      )}
                      <Field label="Guide: bio">
                        <textarea
                          value={pf.guideBio ?? ""}
                          onChange={(e) => updatePanelist(p.id, { guideBio: e.target.value })}
                          rows={4}
                          className="input"
                        />
                      </Field>
                      <Field label="Guide: frameworks">
                        <textarea
                          value={pf.guideFrameworks ?? ""}
                          onChange={(e) =>
                            updatePanelist(p.id, { guideFrameworks: e.target.value })
                          }
                          rows={8}
                          className="input"
                        />
                      </Field>
                      <Field label="Guide: takeaways">
                        <textarea
                          value={pf.guideTakeaways ?? ""}
                          onChange={(e) =>
                            updatePanelist(p.id, { guideTakeaways: e.target.value })
                          }
                          rows={6}
                          className="input"
                        />
                      </Field>
                      <Field label="Guide: quotes">
                        <textarea
                          value={pf.guideQuotes ?? ""}
                          onChange={(e) => updatePanelist(p.id, { guideQuotes: e.target.value })}
                          rows={5}
                          className="input"
                        />
                      </Field>
                      <Field label="Guide: action items">
                        <textarea
                          value={pf.guideActionItems ?? ""}
                          onChange={(e) =>
                            updatePanelist(p.id, { guideActionItems: e.target.value })
                          }
                          rows={6}
                          className="input"
                        />
                      </Field>
                    </div>
                  </CollapsibleSection>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <CollapsibleSection title="Publishing" defaultOpen={true}>
            <Field label="Event date & time">
              <input
                type="datetime-local"
                value={form.eventDate}
                onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
                className="input"
              />
            </Field>
            <Field label="Recording URL">
              <input
                type="text"
                value={form.recordingUrl}
                onChange={(e) => setForm((f) => ({ ...f, recordingUrl: e.target.value }))}
                className="input"
              />
            </Field>
            <Field label="Hero subheading">
              <textarea
                value={form.heroSubheading}
                onChange={(e) => setForm((f) => ({ ...f, heroSubheading: e.target.value }))}
                rows={2}
                className="input"
                placeholder="Hero subheading on /register"
              />
            </Field>
            <Field label="Registration page heading">
              <input
                type="text"
                value={form.registrationHeading}
                onChange={(e) => setForm((f) => ({ ...f, registrationHeading: e.target.value }))}
                className="input"
                placeholder="Final CTA heading on /register"
              />
            </Field>
            <Field label="Registration page supporting line">
              <textarea
                value={form.registrationSubheading}
                onChange={(e) =>
                  setForm((f) => ({ ...f, registrationSubheading: e.target.value }))
                }
                rows={2}
                className="input"
                placeholder="Final CTA supporting line on /register"
              />
            </Field>
            <Field label="Pre-event survey URL">
              <input
                type="text"
                value={form.surveyUrl}
                onChange={(e) => setForm((f) => ({ ...f, surveyUrl: e.target.value }))}
                className="input"
                placeholder="https://... (shown on the post-registration thank-you screen)"
              />
            </Field>
            <Field label="Free gifts public until">
              <input
                type="date"
                value={form.giftPublicUntil}
                onChange={(e) => setForm((f) => ({ ...f, giftPublicUntil: e.target.value }))}
                className="input"
              />
            </Field>

            <Field label="Publish status">
              <select
                value={form.publishStatus}
                onChange={(e) => setForm((f) => ({ ...f, publishStatus: e.target.value }))}
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
                  <span className="text-xs text-gray-400 shrink-0">…/</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    className="input flex-1"
                    autoFocus
                  />
                  <span className="text-xs text-gray-400 shrink-0">/gifts</span>
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
                    <span className="text-xs text-gray-500 truncate">/{form.slug}/gifts</span>
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
          </CollapsibleSection>

          <CollapsibleSection title="Media" defaultOpen={false}>
            <Field label="YouTube video ID">
              <input
                type="text"
                value={form.youtubeId}
                onChange={(e) => setForm((f) => ({ ...f, youtubeId: e.target.value }))}
                className="input"
              />
            </Field>

            <Field label="MP4 URL (Google Drive)">
              <input
                type="text"
                value={form.mp4Url}
                onChange={(e) => setForm((f) => ({ ...f, mp4Url: e.target.value }))}
                className="input"
              />
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
                    onChange={(e) => setForm((f) => ({ ...f, coverArtUrl: e.target.value }))}
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

            {event.thumbnailUrl && (
              <Field label="Thumbnail">
                <img
                  src={event.thumbnailUrl}
                  alt="Event thumbnail"
                  className="w-full rounded-lg border border-gray-200"
                />
              </Field>
            )}

            {event.audioUrl && (
              <Field label="Audio">
                <audio controls className="w-full" src={event.audioUrl}>
                  Your browser does not support audio.
                </audio>
              </Field>
            )}
          </CollapsibleSection>

          <CollapsibleSection
            title="Registrants"
            subtitle={`${event.registrations.length} registered`}
            defaultOpen={false}
          >
            {event.registrations.length === 0 ? (
              <p className="text-xs text-gray-400">No registrations yet.</p>
            ) : (
              <div className="space-y-2">
                {event.registrations.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between text-xs border-b border-gray-100 pb-2"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{r.name}</p>
                      <p className="text-gray-500">{r.email}</p>
                    </div>
                    <p className="text-gray-400 shrink-0 ml-2">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
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
              onClick={handleSendToMake}
              disabled={testing}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {testing ? "Sending..." : "Send to Make.com"}
            </button>

            {event.publishStatus === "approved" && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-lg hover:bg-green-800 disabled:opacity-50 transition-colors"
              >
                {publishing ? "Publishing..." : "Publish event"}
              </button>
            )}
          </CollapsibleSection>
        </div>
      </div>
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
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <span className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      {open && (
        <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-4">{children}</div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
