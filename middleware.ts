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

  const protectedRoutes = [
    "/events/create",
    "/events/[id]/edit",
    "/my-events",
    "/my-registrations",
  ];

  const authRoutes = ["/login", "/register"];

  const isProtectedRoute = protectedRoutes.some((route) => {
    if (route.includes("[id]")) {
      const regex = new RegExp(`^${route.replace("[id]", "[^/]+")}$`);
      return regex.test(pathWithoutLocale);
    }
    return pathWithoutLocale.startsWith(route);
  });

  const isAuthRoute = authRoutes.some((route) =>
    pathWithoutLocale.startsWith(route)
  );

  if (isProtectedRoute && !isAuthenticated) {
    const locale = pathnameLocale || defaultLocale;
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    const locale = pathnameLocale || defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/events`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(uk|en)/:path*", "/content/:path*"],
};
