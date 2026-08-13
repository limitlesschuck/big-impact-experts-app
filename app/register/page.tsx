import { getSoonestUpcomingEvent } from "@/lib/eventAccess";
import { getRegisterPageConfig } from "@/lib/getRegisterPageConfig";
import RegisterPageContent from "@/components/RegisterPageContent";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { ref?: string | string[] };
}) {
  const [event, config] = await Promise.all([
    getSoonestUpcomingEvent(),
    getRegisterPageConfig(),
  ]);

  const ref = Array.isArray(searchParams.ref) ? searchParams.ref[0] : searchParams.ref;

  return <RegisterPageContent event={event} config={config} referredBy={ref} />;
}
