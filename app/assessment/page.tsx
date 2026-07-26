import SiteHeader from "@/components/SiteHeader";

// The Assessment feature (question flow, scoring, coach-referral
// routing) is explicitly out of Phase 1 scope per
// handoff-membership-app.md Section 3 — it's Phase 4. Stubbed.
export default function AssessmentPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Assessment</h1>
        <p className="text-sm text-gray-500">Coming in a later phase.</p>
      </div>
    </div>
  );
}
