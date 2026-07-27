import { getSoonestUpcomingEvent, type PublicEventForRegistration } from "@/lib/eventAccess";
import CountdownBar from "@/components/CountdownBar";
import RegistrationForm from "@/components/RegistrationForm";

export const dynamic = "force-dynamic";

const DEFAULT_REGISTRATION_HEADING = "Don't Miss This Free Event";

function formatEventDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatEventTime(date: Date) {
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

// Supports a simple **word** convention in the title so an admin can
// mark a word for orange emphasis, rather than the page guessing at
// "the natural word to emphasize" from an arbitrary string.
function renderEmphasizedTitle(title: string) {
  return title.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    const match = part.match(/^\*\*([^*]+)\*\*$/);
    if (match) {
      return (
        <span key={i} className="text-brand-orange">
          {match[1]}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function panelistTitle(p: { titleByline: string | null; titleAreaOfExpertise: string | null }) {
  return p.titleByline || p.titleAreaOfExpertise || "";
}

function ExpertCard({
  name,
  title,
  bio,
  headshotUrl,
}: {
  name: string;
  title: string;
  bio?: string | null;
  headshotUrl: string | null;
}) {
  return (
    <div className="text-center">
      {headshotUrl ? (
        <img
          src={headshotUrl}
          alt={name}
          className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border border-gray-200"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-gray-100 mx-auto mb-4" />
      )}
      <p className="font-bold text-gray-900">{name}</p>
      {title && (
        <p className="text-sm text-brand-orange capitalize mt-0.5">{title}</p>
      )}
      {bio && <p className="text-sm text-gray-500 mt-2">{bio}</p>}
    </div>
  );
}

export default async function RegisterPage() {
  const event: PublicEventForRegistration | null = await getSoonestUpcomingEvent();

  if (!event) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center px-6">
        <p className="text-lg text-gray-600 text-center">
          Nothing scheduled right now — check back soon.
        </p>
      </div>
    );
  }

  const eventDateStr = event.eventDate.toISOString();
  const hostTitle = event.hostTitle || "Affiliate Management Expert";
  const heading = event.registrationHeading || DEFAULT_REGISTRATION_HEADING;

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Hero */}
      <div className="bg-brand-navy">
        <div className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
          <p className="text-xs font-semibold tracking-widest text-brand-teal uppercase mb-5">
            Free Live Event — {formatEventDate(event.eventDate)}
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight mb-5">
            {renderEmphasizedTitle(event.titleYoutube ?? event.titleOriginal)}
          </h1>
          {event.descriptionWebsite && (
            <p className="text-base text-white/70 max-w-xl mx-auto mb-12">
              {event.descriptionWebsite}
            </p>
          )}

          <div className="mb-10">
            <CountdownBar eventDate={eventDateStr} />
          </div>

          <a
            href="#register"
            className="inline-block px-8 py-4 bg-brand-orange text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            Save My Free Seat Now
          </a>
          <p className="text-sm text-white/60 mt-4">
            Free to attend. Limited seats. Register now to secure your spot.
          </p>
        </div>
      </div>

      {/* Meet the Experts */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <p className="text-xs font-semibold tracking-widest text-brand-teal uppercase mb-3 text-center">
          Meet the Experts
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy text-center mb-3">
          Learn From These Industry Leaders
        </h2>
        <p className="text-base text-gray-500 text-center max-w-lg mx-auto mb-12">
          Each expert brings a distinct, proven strategy you can apply immediately.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
          <ExpertCard
            name={event.hostName ?? "Chuck Anderson"}
            title={hostTitle}
            headshotUrl={event.hostHeadshotUrl}
          />
          {event.panelists.map((p) => (
            <ExpertCard
              key={p.id}
              name={p.name}
              title={panelistTitle(p)}
              bio={p.bio}
              headshotUrl={p.headshotUrl}
            />
          ))}
        </div>
      </div>

      {/* Note From Your Host */}
      {event.hostNote && (
        <div className="bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6 py-20 grid grid-cols-1 sm:grid-cols-5 gap-10 items-center">
            <div className="sm:col-span-3">
              <p className="text-xs font-semibold tracking-widest text-brand-teal uppercase mb-3">
                A Note From Your Host
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy mb-6">
                Why I Created This Event
              </h2>
              <div className="font-serif text-base text-gray-700 leading-relaxed space-y-4">
                {event.hostNote
                  .split("\n")
                  .map((l) => l.trim())
                  .filter(Boolean)
                  .map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
              </div>
              <p className="text-sm text-gray-500 mt-6">
                — {event.hostName ?? "Chuck Anderson"}, {hostTitle}
              </p>
            </div>
            {event.hostPhotoUrl && (
              <div className="sm:col-span-2">
                <img
                  src={event.hostPhotoUrl}
                  alt={event.hostName ?? "Host"}
                  className="w-full rounded-xl object-cover"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Final CTA / registration form */}
      <div id="register" className="bg-brand-navy scroll-mt-4">
        <div className="max-w-md mx-auto px-6 py-20 text-center">
          <p className="text-xs font-semibold tracking-widest text-brand-teal uppercase mb-3">
            Join Us Live on {formatEventDate(event.eventDate)} — {formatEventTime(event.eventDate)}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{heading}</h2>
          <p className="text-sm text-white/70 mb-8">
            Reserve your free seat now — space is limited and fills up fast.
          </p>
          <RegistrationForm eventId={event.id} />
          <p className="text-xs text-white/50 mt-6">
            {formatEventDate(event.eventDate)} · {formatEventTime(event.eventDate)} — Free to attend
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6">
        <p className="text-xs text-gray-400 text-center">
          © {new Date().getFullYear()} BigImpactExperts.com
        </p>
      </div>
    </div>
  );
}
