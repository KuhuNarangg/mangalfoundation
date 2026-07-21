type EnvCheck = { key: string; required: boolean; note?: string };

const CHECKS: EnvCheck[] = [
  { key: "MONGODB_URI", required: true },
  { key: "JWT_SECRET", required: true },
  { key: "RAZORPAY_KEY_ID", required: false, note: "online donations disabled" },
  { key: "RAZORPAY_KEY_SECRET", required: false },
  { key: "SMTP_USER", required: false, note: "emails disabled" },
  { key: "SMTP_PASS", required: false },
  { key: "CLOUDINARY_CLOUD_NAME", required: false, note: "gallery uploads disabled" },
];

/** Validate environment configuration at startup. Warns (never throws) so a
 *  missing optional integration degrades gracefully instead of crashing. */
export function validateEnv() {
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];

  for (const c of CHECKS) {
    if (!process.env[c.key]) {
      if (c.required) missingRequired.push(c.key);
      else missingOptional.push(`${c.key}${c.note ? ` (${c.note})` : ""}`);
    }
  }

  if (missingRequired.length) {
    console.error(`[env] MISSING REQUIRED variables: ${missingRequired.join(", ")}`);
  }
  if (missingOptional.length) {
    console.warn(`[env] optional variables not set: ${missingOptional.join(", ")}`);
  }
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 24) {
    console.warn("[env] JWT_SECRET is short — use a long random string in production.");
  }
}
