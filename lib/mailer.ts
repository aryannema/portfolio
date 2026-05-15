import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendContactNotification({
  senderName,
  senderEmail,
  message,
}: {
  senderName: string;
  senderEmail: string;
  message: string;
}) {
  await transporter.sendMail({
    from: `"Portfolio OS" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject: `📬 New message from ${senderName}`,
    html: `
      <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 24px; background: #0a0a0a; color: #00ff41; border: 1px solid #1a3a1a;">
        <h2 style="color: #00ff41; font-size: 20px; margin-bottom: 16px;">// NEW CONTACT FORM SUBMISSION</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="color: #ffb000; padding: 6px 0; width: 100px;">FROM:</td><td style="color: #00ff41;">${senderName}</td></tr>
          <tr><td style="color: #ffb000; padding: 6px 0;">EMAIL:</td><td style="color: #00ff41;"><a href="mailto:${senderEmail}" style="color:#00ff41;">${senderEmail}</a></td></tr>
        </table>
        <div style="margin-top: 16px; border-top: 1px solid #1a3a1a; padding-top: 16px;">
          <div style="color: #ffb000; margin-bottom: 8px;">MESSAGE:</div>
          <div style="color: #00b32c; line-height: 1.8; white-space: pre-wrap;">${message}</div>
        </div>
        <div style="margin-top: 24px; color: #1a5a1a; font-size: 12px; border-top: 1px solid #1a3a1a; padding-top: 12px;">
          Sent via Portfolio OS Contact Form
        </div>
      </div>
    `,
  });
}

export async function sendAutoReply({
  toName,
  toEmail,
  ownerName,
}: {
  toName: string;
  toEmail: string;
  ownerName: string;
}) {
  await transporter.sendMail({
    from: `"${ownerName}" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `Got your message — ${ownerName}`,
    html: `
      <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 24px; background: #0a0a0a; color: #00ff41; border: 1px solid #1a3a1a;">
        <h2 style="color: #00ff41; font-size: 18px; margin-bottom: 16px;">// MESSAGE RECEIVED</h2>
        <p style="color: #00b32c; line-height: 1.8;">Hey ${toName},</p>
        <p style="color: #00b32c; line-height: 1.8; margin-top: 12px;">
          Thanks for reaching out! I've received your message and will get back to you as soon as possible — usually within 24–48 hours.
        </p>
        <p style="color: #00b32c; line-height: 1.8; margin-top: 12px;">Talk soon,<br/>${ownerName}</p>
        <div style="margin-top: 24px; color: #1a5a1a; font-size: 12px; border-top: 1px solid #1a3a1a; padding-top: 12px;">
          This is an automated reply from Portfolio OS.
        </div>
      </div>
    `,
  });
}
