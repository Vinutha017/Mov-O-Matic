import nodemailer from "nodemailer";

export interface TripInviteEmailInput {
  recipientEmail: string;
  tripTitle: string;
  destination: string;
  shareLink: string;
  inviterName?: string;
  permission?: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function getTransporter() {
  const host = requireEnv("EMAIL_HOST");
  const port = Number(requireEnv("EMAIL_PORT"));
  const user = requireEnv("EMAIL_USER");
  const pass = requireEnv("EMAIL_PASS");

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user,
      pass,
    },
  });
}

export async function sendTripInviteEmail(input: TripInviteEmailInput) {
  const transporter = getTransporter();
  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const inviterLabel = input.inviterName || "A travel companion";
  const permissionLabel = input.permission || "edit";

  const subject = `You're invited to collaborate on ${input.tripTitle}`;
  const text = [
    `Hi,`,
    "",
    `${inviterLabel} invited you to collaborate on the trip \"${input.tripTitle}\" to ${input.destination}.`,
    `Your access level: ${permissionLabel}.`,
    "",
    `Open the trip here: ${input.shareLink}`,
    "",
    "If you were not expecting this invite, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
      <h2 style="margin:0 0 12px">You're invited to collaborate on ${input.tripTitle}</h2>
      <p>${inviterLabel} invited you to collaborate on the trip <strong>${input.tripTitle}</strong> to <strong>${input.destination}</strong>.</p>
      <p>Your access level: <strong>${permissionLabel}</strong>.</p>
      <p>
        <a href="${input.shareLink}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px">
          Open Trip
        </a>
      </p>
      <p style="color:#6b7280;font-size:14px">If you were not expecting this invite, you can ignore this email.</p>
    </div>
  `;

  const result = await transporter.sendMail({
    from: fromAddress,
    to: input.recipientEmail,
    subject,
    text,
    html,
  });

  return {
    messageId: result.messageId,
    accepted: result.accepted,
    rejected: result.rejected,
  };
}