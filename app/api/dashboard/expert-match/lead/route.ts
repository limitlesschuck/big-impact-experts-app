import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendExpertMatchLeadEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "member") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Same independent check as /api/dashboard/expert-match -- the
  // layout's status gate only re-runs on navigation, not on a fetch
  // from an already-open page.
  const member = await prisma.member.findUnique({
    where: { id: session.user.id },
    select: { status: true },
  });
  if (!member || member.status === "disabled") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const question = typeof body?.question === "string" ? body.question.trim() : "";

  if (!name || !email || !question) {
    return NextResponse.json(
      { error: "name, email, and question are all required" },
      { status: 400 }
    );
  }

  try {
    await sendExpertMatchLeadEmail({ name, email, question });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Expert-match lead email error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
