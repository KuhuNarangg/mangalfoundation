import nodemailer from "nodemailer";

let cachedTransporter: nodemailer.Transporter | null = null;

/** Lazily build a transporter; returns null when SMTP isn't configured. */
function getTransporter(): nodemailer.Transporter | null {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  if (!cachedTransporter) {
    const host = process.env.SMTP_HOST;
    cachedTransporter = nodemailer.createTransport({
      host: host || undefined,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
      secure: process.env.SMTP_SECURE === "true",
      service: host ? undefined : "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return cachedTransporter;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

const fromAddress = () =>
  `"Mangal Guruji Foundation" <${process.env.SMTP_USER}>`;

function alertRecipient(): string | undefined {
  return process.env.ADMIN_ALERT_EMAIL || process.env.SMTP_USER;
}

const row = (label: string, value: string, danger = false) => {
  const color = danger ? "#b91c1c" : "#111";
  const labelColor = danger ? "#b91c1c" : "#6b7280";
  const weight = danger ? "bold" : "normal";
  return `<tr><td style="padding:8px 0;color:${labelColor};border-bottom:1px solid #eee;font-weight:${weight};">${label}</td><td style="padding:8px 0;color:${color};text-align:right;border-bottom:1px solid #eee;font-weight:${weight};">${value}</td></tr>`;
};

export const sendDonationReceipt = async (donation: any): Promise<boolean> => {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("SMTP not configured — skipping donation receipt email.");
    return false;
  }

  try {
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h1 style="color: #1a1a1a; font-size: 24px; font-weight: bold; margin-bottom: 24px; text-align: center;">
          Thank You for Your Donation!
        </h1>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Dear ${donation.donorName},
        </p>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
          We have successfully received your generous contribution. Your support directly empowers our initiatives at the Mangal Guruji Foundation.
        </p>
        <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 32px;">
          <h2 style="color: #1a1a1a; font-size: 18px; font-weight: bold; margin-bottom: 16px; margin-top: 0;">
            Donation Receipt
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              ${donation.receiptNumber ? row("Receipt No.", donation.receiptNumber) : ""}
              ${row("Amount", `₹${donation.amount}`)}
              ${donation.razorpayPaymentId ? row("Transaction ID", `${donation.razorpayPaymentId}`) : ""}
              ${row("Date", new Date(donation.createdAt).toLocaleDateString("en-IN"))}

            </tbody>
          </table>
        </div>
        <p style="color: #4a4a4a; font-size: 14px; line-height: 1.6; text-align: center; margin-bottom: 16px;">
          With gratitude,<br/>
          <strong>Mangal Guruji Foundation</strong>
        </p>
        <p style="text-align:center;margin:0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/receipt/${donation._id}" style="display:inline-block;background:#f43f5e;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:9999px;font-weight:bold;font-size:14px;">View / Download Receipt</a>
        </p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: fromAddress(),
      to: donation.email,
      subject: "Receipt for your Donation - Mangal Guruji Foundation",
      html: htmlTemplate,
    });
    console.log("Receipt email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending receipt email:", error);
    return false;
  }
};

export type FailedLoginAlert = {
  username: string;
  ip: string;
  userAgent: string;
  attempts: number;
  time: Date;
  location?: string;
  isVpn?: boolean;
  locked?: boolean;
};

/** Notify the admin about repeated failed logins (fired every N failed attempts). */
export const sendFailedLoginAlert = async (
  details: FailedLoginAlert
): Promise<boolean> => {
  const transporter = getTransporter();
  const to = alertRecipient();
  if (!transporter || !to) {
    console.warn(
      "SMTP/ADMIN_ALERT_EMAIL not configured — skipping failed-login alert."
    );
    return false;
  }

  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 32px; border: 1px solid #fecaca; border-radius: 8px; background:#fff;">
        <h1 style="color: #b91c1c; font-size: 20px; font-weight: bold; margin: 0 0 16px;">
          ⚠️ Admin Login Security Alert
        </h1>
        <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
          There have been ${details.attempts} failed login attempts on your admin panel${
            details.locked ? " and the account has been temporarily locked for 2 minutes" : ""
          }.
        </p>
        ${
          details.isVpn
            ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:12px;margin-bottom:16px;color:#b91c1c;font-size:14px;">🕵️ The request came from a <strong>VPN / proxy / datacenter IP</strong> — the location below may be spoofed.</div>`
            : ""
        }
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tbody>
            ${row("Username tried", details.username)}
            ${row("Failed attempts", String(details.attempts))}
            ${row("IP address", details.ip)}
            ${details.location ? row("Location", details.location) : ""}
            ${details.isVpn ? row("VPN / Proxy", "Detected — location may be spoofed", true) : ""}
            ${row("Browser / User-Agent", details.userAgent)}
            ${row("Time", details.time.toLocaleString("en-IN"))}
          </tbody>
        </table>
        <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin-top: 24px;">
          If this was you, you can ignore this email. If not, consider rotating your admin password.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: fromAddress(),
      to,
      subject: "⚠️ Admin login alert — Mangal Guruji Foundation",
      html,
    });
    return true;
  } catch (error) {
    console.error("Error sending failed-login alert:", error);
    return false;
  }
};

export type VpnLoginAlert = {
  username: string;
  ip: string;
  userAgent: string;
  location?: string;
  isp?: string;
  time: Date;
};

/** Notify the admin when a successful login comes from a VPN/proxy (masked location). */
export const sendVpnLoginAlert = async (
  details: VpnLoginAlert
): Promise<boolean> => {
  const transporter = getTransporter();
  const to = alertRecipient();
  if (!transporter || !to) {
    console.warn("SMTP/ADMIN_ALERT_EMAIL not configured — skipping VPN-login alert.");
    return false;
  }

  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 32px; border: 1px solid #fed7aa; border-radius: 8px; background:#fff;">
        <h1 style="color: #c2410c; font-size: 20px; font-weight: bold; margin: 0 0 16px;">
          🕵️ Admin Login via VPN / Proxy
        </h1>
        <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
          A <strong>successful</strong> admin login came from a VPN / proxy / datacenter IP, so the reported location may be masked. If this wasn't you, change your password immediately.
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tbody>
            ${row("Account", details.username)}
            ${row("IP address", details.ip)}
            ${details.location ? row("Reported location", details.location) : ""}
            ${details.isp ? row("Network / ISP", details.isp) : ""}
            ${row("VPN / Proxy", "Detected — location may be spoofed", true)}
            ${row("Browser / User-Agent", details.userAgent)}
            ${row("Time", details.time.toLocaleString("en-IN"))}
          </tbody>
        </table>
      </div>
    `;

    await transporter.sendMail({
      from: fromAddress(),
      to,
      subject: "🕵️ Admin login via VPN/Proxy — Mangal Guruji Foundation",
      html,
    });
    return true;
  } catch (error) {
    console.error("Error sending VPN-login alert:", error);
    return false;
  }
};
