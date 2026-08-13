// Shared Systeme.io API client. The API key is a per-deployment secret
// (same account /api/assessment/route.ts already talks to), so it stays
// in an env var rather than SiteConfig -- everything instance-specific
// about *what* gets synced (custom field slugs, etc.) belongs in
// SiteConfig instead, per the no-hardcoded-external-identifiers rule.
const SYSTEME_API_KEY = process.env.SYSTEME_API_KEY ?? "";
const SYSTEME_API_URL = "https://api.systeme.io/api";

export function hasSystemeApiKey(): boolean {
  return !!SYSTEME_API_KEY;
}

function systemeHeaders(contentType: string = "application/json") {
  return {
    "Content-Type": contentType,
    "X-API-Key": SYSTEME_API_KEY,
  };
}

export interface SystemeContactField {
  slug: string;
  value: string;
}

export interface SystemeContact {
  id: string;
  created: boolean;
}

// Looks up a contact by email, creating one if none exists. `fields`
// (custom field values) only take effect on the create path -- Systeme's
// create-contact endpoint accepts them inline, so a brand-new contact
// gets them set in this same call. An already-existing contact needs a
// separate PATCH (see setSystemeContactFields); `created` tells the
// caller which case happened so it knows whether that follow-up call is
// needed.
export async function getOrCreateSystemeContact(
  email: string,
  firstName?: string,
  fields?: SystemeContactField[]
): Promise<SystemeContact | null> {
  const headers = systemeHeaders();

  const getRes = await fetch(
    `${SYSTEME_API_URL}/contacts?email=${encodeURIComponent(email)}`,
    { headers }
  );

  if (getRes.ok) {
    const getData = await getRes.json();
    const existing = getData?.items?.[0];
    if (existing?.id) return { id: String(existing.id), created: false };
  }

  const createRes = await fetch(`${SYSTEME_API_URL}/contacts`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email,
      firstName: firstName || undefined,
      fields: fields && fields.length > 0 ? fields : undefined,
    }),
  });

  if (createRes.ok) {
    const created = await createRes.json();
    if (created?.id) return { id: String(created.id), created: true };
  }

  const error = await createRes.text().catch(() => "unknown");
  console.error("Systeme.io create contact failed:", createRes.status, error);
  return null;
}

// Custom field values on an existing contact. Systeme's PATCH endpoint
// uses JSON Merge Patch (application/merge-patch+json) -- only the
// "fields" key is touched, nothing else on the contact is affected.
export async function setSystemeContactFields(
  contactId: string,
  fields: SystemeContactField[]
): Promise<boolean> {
  if (fields.length === 0) return true;

  const res = await fetch(`${SYSTEME_API_URL}/contacts/${contactId}`, {
    method: "PATCH",
    headers: systemeHeaders("application/merge-patch+json"),
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const error = await res.text().catch(() => "unknown");
    console.error("Systeme.io set contact fields failed:", res.status, error);
  }

  return res.ok;
}

export async function addTagsToSystemeContact(
  contactId: string,
  tagIds: number[]
): Promise<boolean> {
  const headers = systemeHeaders();

  const results = await Promise.all(
    tagIds.map((tagId) =>
      fetch(`${SYSTEME_API_URL}/contacts/${contactId}/tags`, {
        method: "POST",
        headers,
        body: JSON.stringify({ tagId }),
      }).then((r) => r.ok)
    )
  );

  return results.every(Boolean);
}

// Every event registration becomes/updates a Systeme.io contact; the
// referral slug (if any) is forwarded as-is into whichever custom field
// SiteConfig names -- see getSystemeConfig in lib/siteConfig.ts.
export async function syncRegistrationToSysteme(params: {
  email: string;
  name: string;
  referredBy: string | null;
  referralFieldSlug: string;
}): Promise<boolean> {
  if (!hasSystemeApiKey()) return false;

  try {
    const fields: SystemeContactField[] = params.referredBy
      ? [{ slug: params.referralFieldSlug, value: params.referredBy }]
      : [];

    const contact = await getOrCreateSystemeContact(params.email, params.name, fields);
    if (!contact) return false;

    if (fields.length > 0 && !contact.created) {
      return await setSystemeContactFields(contact.id, fields);
    }

    return true;
  } catch (err) {
    console.error("Systeme.io registration sync error:", err);
    return false;
  }
}
