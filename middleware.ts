import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

// Paths that should bypass middleware completely
const PUBLIC_FILE = /\.(.*)$/;

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ Skip static files & public content
  if (
    pathname.startsWith("/content/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // ---- existing logic below ----

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  const pathWithoutLocale = pathnameLocale
    ? pathname.slice(`/${pathnameLocale}`.length)
    : pathname;

  const token = request.cookies.get("auth_token")?.value;
  const isAuthenticated = !!token;

  // Dashboard routes use JWT in localStorage (see tokenManager); auth_token cookie is not set
  // by the app today, so server-side protectedRoutes here would always redirect to login.
  // Auth gating runs in client layouts (e.g. app/[locale]/(dashboard)/layout.tsx).

  const authRoutes = ["/login", "/register"];

  const isAuthRoute = authRoutes.some((route) =>
    pathWithoutLocale.startsWith(route)
  );

  if (isAuthRoute && isAuthenticated) {
    const locale = pathnameLocale || defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/events`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/(uk|en)/:path*",
    "/content/:path*",
    "/((?!_next|content|images|favicon\\.ico|.*\\..*).*)",
  ],
};
