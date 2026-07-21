import type { NextConfig } from "next";

// Baseline security headers applied to every response.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const isProd = process.env.NODE_ENV === "production";

// Content-Security-Policy — allowlists Razorpay checkout. Enforced only in
// production so Turbopack HMR (which needs eval/websockets in dev) isn't broken.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://*.razorpay.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https://fonts.gstatic.com data:",
  "connect-src 'self' https://*.razorpay.com https://lumberjack.razorpay.com",
  "frame-src 'self' https://*.razorpay.com https://api.razorpay.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Next 16 defaults qualities to [75]; expose the levels we actually use.
    qualities: [60, 75, 85, 90],
    // Our images are static assets that rarely change — cache them hard.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [360, 420, 640, 750, 828, 1080, 1200, 1920, 2048],
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  async headers() {
    const headers = [...securityHeaders];
    if (isProd) {
      headers.push({
        key: "Content-Security-Policy",
        value: contentSecurityPolicy,
      });
    }
    return [{ source: "/:path*", headers }];
  },
};

export default nextConfig;
