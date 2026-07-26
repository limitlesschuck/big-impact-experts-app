import SiteHeader from "@/components/SiteHeader";

// The old public "browse guides, email-gated PDF download" page doesn't
// map onto Phase 1 — panelist guides are members-only dashboard content
// (see handoff-membership-app.md Section 4), not a public lead magnet.
// Stubbed pending the Member Dashboard build.
export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Guides</h1>
        <p className="text-sm text-gray-500">
          Guides are available to members in the member dashboard (coming soon).
        </p>
      </div>
    </div>
  );
}
