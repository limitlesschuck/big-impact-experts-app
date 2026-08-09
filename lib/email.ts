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
