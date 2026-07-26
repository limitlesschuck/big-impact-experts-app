import SiteHeader from "@/components/SiteHeader";

// Placeholder homepage — the real public site (hero, membership offer,
// social proof, featured experts) is a follow-up task once there's real
// BIE copy and branding to build it from. This just confirms the
// Event/Panelist data model compiles end-to-end.

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Big Impact Experts
        </h1>
        <p className="text-sm text-gray-500">Site content coming soon.</p>
      </div>
    </div>
  );
}
