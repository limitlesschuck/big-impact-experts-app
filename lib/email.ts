import { Resend } from "resend";

const FROM_ADDRESS = "Big Impact Experts <community@eventaffiliates.com>";

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not set");
  return new Resend(apiKey);
}

export async function sendWelcomeEmail(email: string, setPasswordUrl: string): Promise<void> {
  const resend = getResendClient();

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: "Welcome — set your password",
    html: `
      <p>Welcome to Big Impact Experts!</p>
      <p>Click the link below to set your password and access your member account.</p>
      <p><a href="${setPasswordUrl}">Set your password</a></p>
      <p>This link expires in 48 hours. If it's expired by the time you click it, contact us and we'll send a new one.</p>
    `,
  });

  if (error) {
    throw new Error(`Resend error sending welcome email: ${error.message}`);
  }
}

export async function sendPasswordResetEmail(email: string, setPasswordUrl: string): Promise<void> {
  const resend = getResendClient();

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: "Reset your password",
    html: `
      <p>We received a request to reset your Big Impact Experts password.</p>
      <p>Click the link below to choose a new password.</p>
      <p><a href="${setPasswordUrl}">Reset your password</a></p>
      <p>This link expires in 48 hours. If it's expired by the time you click it, request a new one from the login page.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });

  if (error) {
    throw new Error(`Resend error sending password reset email: ${error.message}`);
  }
}

// Only needed here -- the other email functions above interpolate
// self-generated token URLs, not free-form user input. The question
// (and, in principle, the editable name field) comes straight from a
// chat box, so it needs escaping before landing in a raw HTML body.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendExpertMatchLeadEmail(params: {
  name: string;
  email: string;
  question: string;
}): Promise<void> {
  const resend = getResendClient();

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: "community@eventaffiliates.com",
    replyTo: params.email,
    subject: `Expert Match: unanswered question from ${params.name}`,
    html: `
      <p><strong>${escapeHtml(params.name)}</strong> (${escapeHtml(params.email)}) asked the Expert Match widget a question that didn't match any expert's guide content:</p>
      <p>"${escapeHtml(params.question)}"</p>
      <p>They'd like a direct follow-up.</p>
    `,
  });

  if (error) {
    throw new Error(`Resend error sending expert-match lead email: ${error.message}`);
  }
}
