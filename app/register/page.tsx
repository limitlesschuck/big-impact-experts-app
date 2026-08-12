import { getSoonestUpcomingEvent } from "@/lib/eventAccess";
import { getRegisterPageConfig } from "@/lib/getRegisterPageConfig";
import RegisterPageContent from "@/components/RegisterPageContent";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const [event, config] = await Promise.all([
    getSoonestUpcomingEvent(),
    getRegisterPageConfig(),
  ]);

  return <RegisterPageContent event={event} config={config} />;
}
