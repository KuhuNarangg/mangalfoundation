/**
 * Helpers to extract client metadata from an incoming request.
 * Works behind common proxies/CDNs (Vercel, Cloudflare, nginx).
 */

export function getClientIp(req: Request): string {
  const h = req.headers;
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return (
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    h.get("x-vercel-forwarded-for") ||
    "unknown"
  );
}

export function getUserAgent(req: Request): string {
  return req.headers.get("user-agent") || "unknown";
}

/** Best-effort geo string from CDN headers ("City, CC"); empty if unavailable. */
export function getGeoLocation(req: Request): string {
  const h = req.headers;
  const rawCity = h.get("x-vercel-ip-city") || h.get("cf-ipcity") || "";
  const country =
    h.get("x-vercel-ip-country") || h.get("cf-ipcountry") || "";
  let city = "";
  try {
    city = rawCity ? decodeURIComponent(rawCity) : "";
  } catch {
    city = rawCity;
  }
  return [city, country].filter(Boolean).join(", ");
}
