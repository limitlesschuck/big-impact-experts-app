import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";
import type { Member } from "@prisma/client";

const PASSWORD_RESET_TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

// The DB stores a hash of the reset token, never the raw value -- the raw
// token only ever exists in the emailed link. A leaked DB row alone can't
// be used to take over the account.
export function hashResetToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

function baseUrl(): string {
  const url = process.env.NEXTAUTH_URL;
  if (!url) throw new Error("NEXTAUTH_URL not set");
  return url.replace(/\/$/, "");
}

function oneYearFrom(date: Date): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + 1);
  return d;
}

// Shared by both member-creation paths (webhook + admin-manual) so they
// stay identical rather than drifting into two slightly different flows.
// Idempotent: an existing Member for this email is left untouched and no
// email is re-sent, since webhook retries are normal and shouldn't spam
// duplicate welcome emails or hit the email @unique constraint.
export async function createMemberAndSendWelcomeEmail(
  rawEmail: string,
  options: { firstName?: string; lastName?: string } = {}
): Promise<{ member: Member; created: boolean }> {
  const email = rawEmail.trim().toLowerCase();

  const existing = await prisma.member.findUnique({ where: { email } });
  if (existing) {
    return { member: existing, created: false };
  }

  const placeholderPassword = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12);
  const rawToken = crypto.randomBytes(32).toString("hex");
  // Captured once so expiresAt is exactly createdAt + 1 year, not just
  // approximately (Prisma's own @default(now()) would be a separate,
  // independently-evaluated timestamp otherwise).
  const now = new Date();

  const member = await prisma.member.create({
    data: {
      email,
      firstName: options.firstName?.trim() || null,
      lastName: options.lastName?.trim() || null,
      password: placeholderPassword,
      passwordResetToken: hashResetToken(rawToken),
      passwordResetExpires: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
      createdAt: now,
      expiresAt: oneYearFrom(now),
    },
  });

  const setPasswordUrl = `${baseUrl()}/set-password?token=${rawToken}`;
  await sendWelcomeEmail(email, setPasswordUrl);

  return { member, created: true };
}
