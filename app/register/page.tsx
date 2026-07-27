import { getSoonestUpcomingEvent, type PublicEventForRegistration } from "@/lib/eventAccess";
import CountdownBar from "@/components/CountdownBar";
import RegistrationForm from "@/components/RegistrationForm";

export const dynamic = "force-dynamic";

const DEFAULT_HOST_NAME = "Chuck Anderson";
const DEFAULT_HOST_TITLE = "Affiliate Management Expert";
const DEFAULT_REGISTRATION_HEADING = "Ready to Grow Your Impact, Influence, and Income?";
const DEFAULT_REGISTRATION_SUBHEADING =
  "YES! I Want To Attend This Free Event With Chuck Anderson & Learn How To Make A Bigger Impact, Grow My Influence, And Earn More Profit — From 6 Industry Experts In Just 90 Minutes!";

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

// Falsy-safe fallback -- "" (empty string) must fall through just like
// null/undefined does. Plain `??` doesn't catch empty string, which is
// exactly what broke the hero title in production: the admin edit form
// writes "" (not null) for any untouched optional field on save.
function orDefault(value: string | null | undefined, fallback: string): string {
  return value && value.trim() ? value : fallback;
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
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover mx-auto mb-4 border border-gray-200"
        />
      ) : (
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gray-100 mx-auto mb-4" />
      )}
      <p className="text-lg font-bold text-gray-900">{name}</p>
      {title && (
        <p className="text-base text-brand-orange capitalize mt-1">{title}</p>
      )}
      {bio && <p className="text-base text-gray-500 mt-2 leading-relaxed">{bio}</p>}
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
  const hostName = orDefault(event.hostName, DEFAULT_HOST_NAME);
  const hostTitle = orDefault(event.hostTitle, DEFAULT_HOST_TITLE);
  const heroTitle = orDefault(event.titleYoutube, event.titleOriginal);
  const heading = orDefault(event.registrationHeading, DEFAULT_REGISTRATION_HEADING);
  const subheading = orDefault(event.registrationSubheading, DEFAULT_REGISTRATION_SUBHEADING);

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Hero */}
      <div className="bg-brand-navy">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 pt-20 sm:pt-24 lg:pt-28 pb-16 sm:pb-20 text-center">
          <p className="text-sm sm:text-base font-semibold tracking-widest text-brand-teal uppercase mb-6">
            Free Live Event — {formatEventDate(event.eventDate)}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {renderEmphasizedTitle(heroTitle)}
          </h1>
          {event.descriptionWebsite && (
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-14">
              {event.descriptionWebsite}
            </p>
          )}

          <div className="mb-12">
            <CountdownBar eventDate={eventDateStr} />
          </div>

          <a
            href="#register"
            className="inline-block px-10 py-5 bg-brand-orange text-white text-lg font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            Save My Free Seat Now
          </a>
          <p className="text-base text-white/60 mt-5">
            Free to attend. Limited seats. Register now to secure your spot.
          </p>
        </div>
      </div>

      {/* Meet the Experts */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-24">
        <p className="text-sm sm:text-base font-semibold tracking-widest text-brand-teal uppercase mb-4 text-center">
          Meet the Experts
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-navy text-center mb-4">
          Learn From These Industry Leaders
        </h2>
        <p className="text-lg text-gray-500 text-center max-w-2xl mx-auto mb-16">
          Each expert brings a distinct, proven strategy you can apply immediately.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-x-10 lg:gap-y-16">
          <ExpertCard
            name={hostName}
            title={hostTitle}
            bio={event.hostBio}
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
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-24 grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-3">
              <p className="text-sm sm:text-base font-semibold tracking-widest text-brand-teal uppercase mb-4">
                A Note From Your Host
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-navy mb-8">
                Why I Created This Event
              </h2>
              <div className="font-serif text-lg sm:text-xl text-gray-700 leading-relaxed space-y-5">
                {event.hostNote
                  .split("\n")
                  .map((l) => l.trim())
                  .filter(Boolean)
                  .map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
              </div>
              <p className="text-base text-gray-500 mt-8">
                — {hostName}, {hostTitle}
              </p>
            </div>
            {event.hostPhotoUrl && (
              <div className="lg:col-span-2">
                <img
                  src={event.hostPhotoUrl}
                  alt={hostName}
                  className="w-full rounded-xl object-cover"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Final CTA / registration form */}
      <div id="register" className="bg-brand-navy scroll-mt-4">
        <div className="max-w-2xl mx-auto px-6 sm:px-8 py-20 sm:py-24 text-center">
          <p className="text-sm sm:text-base font-semibold tracking-widest text-brand-teal uppercase mb-4">
            Join Us Live on {formatEventDate(event.eventDate)} — {formatEventTime(event.eventDate)}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            {heading}
          </h2>
          <p className="text-base sm:text-lg text-white/70 mb-10">{subheading}</p>
          <RegistrationForm eventId={event.id} />
          <p className="text-sm text-white/50 mt-6">
            {formatEventDate(event.eventDate)} · {formatEventTime(event.eventDate)} — Free to attend
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6">
        <p className="text-sm text-gray-400 text-center">
          © {new Date().getFullYear()} BigImpactExperts.com
        </p>
      </div>
    </div>
  );
}
