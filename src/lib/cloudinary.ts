import crypto from "crypto";

/**
 * Sign Cloudinary upload params (SHA-1 of sorted `key=value` pairs + api secret).
 * Signed uploads mean we never expose the API secret to the browser and don't
 * need an unsigned upload preset.
 */
export function signUploadParams(params: Record<string, string | number>): string {
  const secret = process.env.CLOUDINARY_API_SECRET || "";
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHash("sha1").update(toSign + secret).digest("hex");
}

export function cloudinaryConfig() {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    secret: process.env.CLOUDINARY_API_SECRET || "",
  };
}

export function isCloudinaryConfigured(): boolean {
  const { cloudName, apiKey, secret } = cloudinaryConfig();
  return Boolean(cloudName && apiKey && secret);
}
