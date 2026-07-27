import {
  getSoonestUpcomingEvent,
  type PublicEventForRegistration,
} from "@/lib/eventAccess";
import { buildRegisterPageCss } from "@/lib/registerPageConfig";
import { getRegisterPageConfig } from "@/lib/getRegisterPageConfig";
import CountdownBar from "@/components/CountdownBar";
import RegistrationForm from "@/components/RegistrationForm";

export const dynamic = "force-dynamic";

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
        <span key={i} className="rp-orange">
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
          className="rp-card-headshot rounded-full object-cover mx-auto mb-4 border border-gray-200"
        />
      ) : (
        <div className="rp-card-headshot rounded-full bg-gray-100 mx-auto mb-4" />
      )}
      <p className="rp-card-name font-bold text-gray-900">{name}</p>
      {title && <p className="rp-card-title rp-orange capitalize mt-1">{title}</p>}
      {bio && <p className="rp-card-bio text-gray-500 mt-2 leading-relaxed">{bio}</p>}
    </div>
  );
}

export default async function RegisterPage() {
  const [event, config]: [PublicEventForRegistration | null, Awaited<ReturnType<typeof getRegisterPageConfig>>] =
    await Promise.all([getSoonestUpcomingEvent(), getRegisterPageConfig()]);

  const css = buildRegisterPageCss(config);
  const t = config.text;

  if (!event) {
    return (
      <div className="min-h-screen rp-bg-page flex items-center justify-center px-6">
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <p className="text-lg text-gray-600 text-center">{t.nothingScheduledMessage}</p>
      </div>
    );
  }

  const eventDateStr = event.eventDate.toISOString();
  const hostName = orDefault(event.hostName, "Chuck Anderson");
  const hostTitle = orDefault(event.hostTitle, "Affiliate Management Expert");
  const heroTitle = orDefault(event.titleYoutube, event.titleOriginal);
  const heroSubheading = orDefault(event.heroSubheading, t.defaultHeroSubheading);
  const heading = orDefault(event.registrationHeading, t.defaultRegistrationHeading);
  const subheading = orDefault(event.registrationSubheading, t.defaultRegistrationSubheading);

  return (
    <div className="min-h-screen rp-bg-page">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Hero */}
      <div className="rp-bg-navy">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 pt-20 sm:pt-24 lg:pt-28 pb-16 sm:pb-20 text-center">
          <p className="rp-eyebrow rp-teal font-semibold tracking-widest uppercase mb-6">
            {t.heroEyebrowPrefix} {formatEventDate(event.eventDate)}
          </p>
          <h1 className="rp-hero-title font-bold text-white leading-tight mb-6">
            {renderEmphasizedTitle(heroTitle)}
          </h1>
          <p className="rp-hero-subtitle text-white/70 max-w-2xl mx-auto mb-14">
            {heroSubheading}
          </p>

          <div className="mb-12">
            <CountdownBar
              eventDate={eventDateStr}
              dayLabel={t.countdownDayLabel}
              hourLabel={t.countdownHourLabel}
              minuteLabel={t.countdownMinuteLabel}
              secondLabel={t.countdownSecondLabel}
              finishedMessage={t.countdownFinishedMessage}
            />
          </div>

          <a
            href="#register"
            className="rp-button-text inline-block px-10 py-5 rp-bg-orange text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            {t.heroCtaButton}
          </a>
          <p className="text-base text-white/60 mt-5">{t.heroSupportingLine}</p>
        </div>
      </div>

      {/* Meet the Experts */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-24">
        <p className="rp-eyebrow rp-teal font-semibold tracking-widest uppercase mb-4 text-center">
          {t.expertsEyebrow}
        </p>
        <h2 className="rp-section-heading font-bold rp-navy text-center mb-4">
          {t.expertsHeading}
        </h2>
        <p className="rp-section-subhead text-gray-500 text-center max-w-2xl mx-auto mb-16">
          {t.expertsSubhead}
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
              bio={p.shortBio || p.bio}
              headshotUrl={p.headshotUrl}
            />
          ))}
        </div>
      </div>

      {/* Note From Your Host */}
      {event.hostNote && (
        <div className="bg-white border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-20 sm:pt-24 grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-3 pb-20 sm:pb-24">
              <p className="rp-eyebrow rp-teal font-semibold tracking-widest uppercase mb-4">
                {t.hostNoteEyebrow}
              </p>
              <h2 className="rp-section-heading font-bold rp-navy mb-8">{t.hostNoteHeading}</h2>
              <div className="rp-host-note-body font-serif text-gray-700 leading-relaxed space-y-5">
                {event.hostNote
                  .split("\n")
                  .map((l) => l.trim())
                  .filter(Boolean)
                  .map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
              </div>
              <p className="rp-attribution text-gray-500 mt-8">
                — {hostName}, {hostTitle}
              </p>
            </div>
            {event.hostPhotoUrl && (
              <div className="lg:col-span-2 self-end">
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
      <div id="register" className="rp-bg-navy scroll-mt-4">
        <div className="max-w-2xl mx-auto px-6 sm:px-8 py-20 sm:py-24 text-center">
          <p className="rp-eyebrow rp-teal font-semibold tracking-widest uppercase mb-4">
            {t.finalCtaEyebrowPrefix} {formatEventDate(event.eventDate)} —{" "}
            {formatEventTime(event.eventDate)}
          </p>
          <h2 className="rp-section-heading font-bold text-white mb-6">{heading}</h2>
          <p className="rp-hero-subtitle text-white/70 mb-10">{subheading}</p>
          <RegistrationForm
            eventId={event.id}
            buttonLabel={t.heroCtaButton}
            surveyUrl={event.surveyUrl}
          />
          <p className="rp-small-print text-white/50 mt-6">
            {formatEventDate(event.eventDate)} · {formatEventTime(event.eventDate)} —{" "}
            {t.finalCtaSmallPrintSuffix}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6">
        <p className="rp-small-print text-gray-400 text-center">
          © {new Date().getFullYear()} {t.footerText}
        </p>
      </div>
    </div>
  );
}
