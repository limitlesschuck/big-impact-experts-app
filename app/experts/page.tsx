import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import PublicExpertDirectory from "@/components/marketing/PublicExpertDirectory";
import { getDirectoryPanelists } from "@/lib/eventAccess";

export const dynamic = "force-dynamic";

export default async function ExpertsPage() {
  const panelists = await getDirectoryPanelists();

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <div className="bg-brand-navy">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 sm:pt-20 pb-14 sm:pb-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Meet Our Experts</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Every expert who&rsquo;s shared their proven strategies on a Big Impact Experts panel.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
        <PublicExpertDirectory panelists={panelists} />
      </div>

      <div className="bg-brand-bg">
        <div className="max-w-2xl mx-auto px-6 sm:px-8 py-16 sm:py-20 text-center">
          <h2 className="text-2xl font-bold text-brand-navy mb-4">
            Want the replay, guide, and gift from every expert?
          </h2>
          <p className="text-gray-600 mb-8">
            Members get full access to every session, plus AI Expert Match to find exactly who
            can help with what you&rsquo;re working on.
          </p>
          <Link
            href="/membership"
            className="inline-block px-8 py-4 bg-brand-orange text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            Become a Member
          </Link>
        </div>
      </div>

      <div className="py-8 border-t border-gray-100">
        <p className="text-sm text-gray-400 text-center">
          © {new Date().getFullYear()} BigImpactExperts.com ·{" "}
          <Link href="/contact" className="hover:text-gray-600">
            Contact
          </Link>
        </p>
      </div>
    </div>
  );
}
