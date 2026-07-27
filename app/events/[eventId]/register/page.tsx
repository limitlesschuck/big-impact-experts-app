import { notFound } from "next/navigation";
import { getPublicEventForRegistration } from "@/lib/eventAccess";
import CountdownBar from "@/components/CountdownBar";
import RegistrationForm from "@/components/RegistrationForm";

export const dynamic = "force-dynamic";

function panelistTitle(p: { titleByline: string | null; titleAreaOfExpertise: string | null }) {
  return p.titleByline || p.titleAreaOfExpertise || "";
}

export default async function EventRegisterPage({
  params,
}: {
  params: { eventId: string };
}) {
  const event = await getPublicEventForRegistration(params.eventId);
  if (!event) notFound();

  const eventDateStr = event.eventDate.toISOString();

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 pt-20 pb-14 text-center">
        <p className="text-xs font-semibold tracking-widest text-brand-teal uppercase mb-4">
          Big Impact Experts
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold text-brand-navy leading-tight mb-4">
          {event.titleYoutube ?? event.titleOriginal}
        </h1>
        {event.descriptionWebsite && (
          <p className="text-base text-gray-600 max-w-xl mx-auto">
            {event.descriptionWebsite}
          </p>
        )}
        <p className="text-sm text-gray-500 mt-6">
          {event.eventDate.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          {" · "}
          {event.eventDate.toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* Countdown */}
      <CountdownBar eventDate={eventDateStr} />

      <div className="max-w-3xl mx-auto px-6 py-16 space-y-16">
        {/* Meet the experts */}
        {event.panelists.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold tracking-widest text-brand-teal uppercase mb-6 text-center">
              Meet the Experts
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {event.panelists.map((p) => (
                <div key={p.id} className="text-center">
                  {p.headshotUrl ? (
                    <img
                      src={p.headshotUrl}
                      alt={p.name}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-100 mx-auto mb-3" />
                  )}
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  {panelistTitle(p) && (
                    <p className="text-xs text-gray-500 mt-0.5">{panelistTitle(p)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Note from the host */}
        {event.hostNote && (
          <div className="border-t border-gray-200 pt-12">
            <h2 className="text-xs font-semibold tracking-widest text-brand-teal uppercase mb-4 text-center">
              A Note from {event.hostName ?? "Your Host"}
            </h2>
            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap max-w-xl mx-auto italic">
              {event.hostNote}
            </p>
          </div>
        )}

        {/* Registration form */}
        <div className="border-t border-gray-200 pt-12 max-w-sm mx-auto w-full">
          <h2 className="text-lg font-semibold text-brand-navy text-center mb-6">
            Reserve Your Spot
          </h2>
          <RegistrationForm eventId={event.id} />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 py-6">
        <p className="text-xs text-gray-400 text-center">
          © {new Date().getFullYear()} BigImpactExperts.com
        </p>
      </div>
    </div>
  );
}
