import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

// Resolve API origin at startup so it can be included in connect-src.
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
let apiOrigin = "";
try {
  if (apiUrl) apiOrigin = new URL(apiUrl).origin;
} catch {
  // Malformed or missing URL — omitted from CSP connect-src
}

const isProd = process.env.NODE_ENV === "production";

/**
 * Build the Content-Security-Policy directive string.
 *
 * Currently deployed as Content-Security-Policy-Report-Only so violations are
 * logged but not blocked.  Change the header key to Content-Security-Policy
 * once the violation log is clean to move into enforcement.
 *
 * 'unsafe-inline' is required today because:
 *   - next-themes injects a blocking inline script for theme detection
 *   - JSON-LD <script> tags in the locale layout use dangerouslySetInnerHTML
 * Eliminate it by moving to nonce-based CSP (next.js nonce + middleware) in
 * a follow-up hardening pass.
 */
function buildCsp(origin) {
  const connectSrc = ["'self'", origin, "https://vitals.vercel-insights.com"]
    .filter(Boolean)
    .join(" ");

  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com",
    "font-src 'self'",
    `connect-src ${connectSrc}`,
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
  ].join("; ");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/**": ["./content/*.md"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    const securityHeaders = [
      // Clickjacking — defense in depth alongside CSP frame-ancestors
      { key: "X-Frame-Options", value: "DENY" },
      // Prevent MIME-type sniffing
      { key: "X-Content-Type-Options", value: "nosniff" },
      // Reduce referrer leakage to cross-origin requests
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // Restrict browser feature APIs not used by this app
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      // CSP in report-only mode — switch key to enforce once violations are resolved
      {
        key: "Content-Security-Policy-Report-Only",
        value: buildCsp(apiOrigin),
      },
    ];

    // HSTS only over HTTPS — browsers ignore it on HTTP origins
    if (isProd) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }

    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
