export type GeoInfo = {
  city: string;
  region: string;
  country: string;
  isp: string;
  proxy: boolean;
  hosting: boolean;
  mobile: boolean;
  locationString: string;
  isVpn: boolean;
};

const EMPTY: GeoInfo = {
  city: "",
  region: "",
  country: "",
  isp: "",
  proxy: false,
  hosting: false,
  mobile: false,
  locationString: "",
  isVpn: false,
};

function isPrivateIp(ip: string): boolean {
  return (
    !ip ||
    ip === "unknown" ||
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("::ffff:127.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  );
}

/**
 * Resolve an IP to an exact location and detect whether it is a VPN / proxy /
 * datacenter address (which would mean the reported location is untrustworthy).
 * Uses ip-api.com (free, no key). Fails gracefully — never throws.
 */
export async function lookupGeo(ip: string): Promise<GeoInfo> {
  if (isPrivateIp(ip)) {
    return { ...EMPTY, city: "Local", locationString: "Local network" };
  }
  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city,isp,proxy,hosting,mobile`,
      { signal: AbortSignal.timeout(3500) }
    );
    const d = await res.json();
    if (d.status !== "success") return EMPTY;

    const proxy = Boolean(d.proxy);
    const hosting = Boolean(d.hosting);
    const locationString = [d.city, d.regionName, d.country]
      .filter(Boolean)
      .join(", ");
    return {
      city: d.city || "",
      region: d.regionName || "",
      country: d.country || "",
      isp: d.isp || "",
      proxy,
      hosting,
      mobile: Boolean(d.mobile),
      locationString,
      isVpn: proxy || hosting,
    };
  } catch {
    return EMPTY;
  }
}
