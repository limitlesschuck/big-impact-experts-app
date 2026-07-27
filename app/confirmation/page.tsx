import Link from "next/link";
import { buildRegisterPageCss } from "@/lib/registerPageConfig";
import { getRegisterPageConfig } from "@/lib/getRegisterPageConfig";

export const dynamic = "force-dynamic";

// The survey URL arrives via query string from RegistrationForm -- only
// ever rendered as a plain <a href>, never executed, but we still only
// trust it as a link if it looks like an actual http(s) URL.
function safeSurveyUrl(value: string | string[] | undefined): string | null {
  const url = Array.isArray(value) ? value[0] : value;
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : null;
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: { survey?: string | string[] };
}) {
  const config = await getRegisterPageConfig();
  const css = buildRegisterPageCss(config);
  const surveyUrl = safeSurveyUrl(searchParams.survey);

  return (
    <div className="min-h-screen rp-bg-navy flex items-center justify-center px-6 py-16">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="bg-white rounded-2xl p-8 sm:p-10 max-w-lg w-full text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
          Thank You For Registering!
        </h1>
        <p className="text-gray-600 mb-8">
          Your confirmation email with your access link has been sent to your inbox
        </p>

        {surveyUrl && (
          <>
            <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                One quick favor — it takes less than 60 seconds
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Please complete this short pre-training survey. Your answers will help me
                customize the content so this training is as relevant and valuable as possible
                for you personally.
              </p>
              <a
                href={surveyUrl}
                className="inline-block px-8 py-3 rp-bg-navy text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
              >
                Complete The Pre-Event Survey
              </a>
              <p className="text-xs text-gray-500 mt-4">
                Less than 1 minute · Makes a big difference
              </p>
            </div>

            <Link
              href="/register/thank-you"
              className="inline-block text-sm text-blue-700 underline mt-6"
            >
              No thanks, I don&rsquo;t want to do the survey.
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
