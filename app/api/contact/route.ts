import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";

const MAX_MESSAGE_LENGTH = 5000;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  // Honeypot: a real visitor never sees or fills this field (it's
  // visually hidden, not display:none, since some bots skip fields that
  // are outright removed from layout). A filled value means a bot --
  // report success without sending anything, so the bot has no signal
  // that it was caught and doesn't retry with a different approach.
  const honeypot = typeof body?.company === "string" ? body.company.trim() : "";
  if (honeypot) {
    return NextResponse.json({ success: true });
  }

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "name, email, and message are all required" },
      { status: 400 }
    );
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Message is too long" }, { status: 400 });
  }

  try {
    await sendContactEmail({ name, email, message });
    return NextResponse.json({ success: true });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Contact form email error:", error);
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
