import { getSoonestUpcomingEvent } from "@/lib/eventAccess";
import { getRegisterPageConfig } from "@/lib/getRegisterPageConfig";
import RegisterPageContent from "@/components/RegisterPageContent";
import BackToDashboardLink from "@/components/member/BackToDashboardLink";

export const dynamic = "force-dynamic";

// Same event/config data as the public /register page (no new query, no
// new logic) -- just rendered inside the dashboard shell instead of the
// public SiteHeader shell.
export default async function UpcomingEventsPage() {
  const [event, config] = await Promise.all([
    getSoonestUpcomingEvent(),
    getRegisterPageConfig(),
  ]);

  return (
    <div>
      <BackToDashboardLink />
      <div className="mt-3 -mx-8 -mb-8">
        <RegisterPageContent event={event} config={config} />
      </div>
    </div>
  );
}
