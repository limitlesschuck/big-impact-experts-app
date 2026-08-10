import { NextRequest, NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/memberAuth";

const GENERIC_MESSAGE = "If that email exists, we've sent a reset link.";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";

  // The response is identical whether the email exists, doesn't exist, or
  // something internally failed while trying to send it (e.g. Resend is
  // down) -- a distinct error status only for the "member exists" path
  // would itself be an oracle for enumerating real member emails, even
  // with identical response bodies.
  if (email) {
    try {
      await requestPasswordReset(email);
    } catch (error) {
      console.error("Forgot-password error:", error);
    }
  }

  return NextResponse.json({ message: GENERIC_MESSAGE });
}
