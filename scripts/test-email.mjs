// Send a test email using your .env.local settings.
// Run:  node --env-file=.env.local scripts/test-email.mjs
import nodemailer from "nodemailer";

const {
  SMTP_USER,
  SMTP_PASS,
  ADMIN_ALERT_EMAIL,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
} = process.env;

if (!SMTP_USER || !SMTP_PASS) {
  console.error(
    "❌ Set SMTP_USER and SMTP_PASS in .env.local first (SMTP_PASS = your Gmail App Password)."
  );
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST || undefined,
  port: SMTP_PORT ? Number(SMTP_PORT) : undefined,
  secure: SMTP_SECURE === "true",
  service: SMTP_HOST ? undefined : "gmail",
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

try {
  await transporter.verify();
  console.log("✅ SMTP connection OK");

  const to = ADMIN_ALERT_EMAIL || SMTP_USER;
  const info = await transporter.sendMail({
    from: `"Mangal Guruji Foundation" <${SMTP_USER}>`,
    to,
    subject: "✅ Test email — Mangal Guruji Foundation",
    html: "<p>If you can read this, your foundation emails (receipts + security alerts) are working. 🎉</p>",
  });
  console.log(`✅ Test email sent (${info.messageId}) → ${to}`);
} catch (e) {
  console.error("❌ Email failed:", e.message);
  if (/Invalid login|Username and Password not accepted|BadCredentials/i.test(e.message)) {
    console.error(
      "   → This usually means SMTP_PASS is not a valid Gmail App Password, or 2-Step Verification is off."
    );
  }
  process.exit(1);
}
