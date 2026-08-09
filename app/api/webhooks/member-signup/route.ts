import { NextRequest, NextResponse } from "next/server";
import { createMemberAndSendWelcomeEmail } from "@/lib/memberAuth";

// Fired by Systeme.io (or another platform) on successful signup/payment.
// The exact payload shape isn't confirmed yet -- this hasn't been tested
// against a real Systeme.io webhook -- so email extraction is defensive
// across a few plausible nesting shapes, and the raw body is logged so a
// field-path mismatch on the first real firing is immediately visible
// and fixable rather than failing silently.
function extractEmail(body: Record<string, unknown>): string | null {
  const candidates = [
    body.email,
    (body.contact as Record<string, unknown> | undefined)?.email,
    (body.data as Record<string, unknown> | undefined)?.email,
    (
      (body.data as Record<string, unknown> | undefined)?.contact as
        | Record<string, unknown>
        | undefined
    )?.email,
  ];
  const email = candidates.find((c): c is string => typeof c === "string" && c.trim().length > 0);
  return email ?? null;
}

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.MEMBER_WEBHOOK_SECRET;
  if (!expected) return false;
  const headerSecret = req.headers.get("x-webhook-secret");
  const querySecret = req.nextUrl.searchParams.get("secret");
  return headerSecret === expected || querySecret === expected;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  console.log("Member signup webhook received:", JSON.stringify(body));

  const email = extractEmail(body as Record<string, unknown>);
  if (!email) {
    return NextResponse.json(
      { error: "Could not find an email in the webhook payload" },
      { status: 400 }
    );
  }

  try {
    const { created } = await createMemberAndSendWelcomeEmail(email);
    return NextResponse.json({
      created,
      reason: created ? undefined : "already exists",
    });
  } catch (error) {
    console.error("Member signup webhook error:", error);
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
}
