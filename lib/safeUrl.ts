// Shared by /confirmation and /vip-offer -- both receive a survey URL via
// query string (RegistrationForm -> /vip-offer -> forwarded on to
// /confirmation), only ever rendered as a plain <a href>, never executed.
// Still only trusted as a link if it looks like an actual http(s) URL.
export function safeSurveyUrl(value: string | string[] | undefined): string | null {
  const url = Array.isArray(value) ? value[0] : value;
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : null;
}
