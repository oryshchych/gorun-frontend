import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";
import { NextRequest, NextResponse } from "next/server";

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always use locale prefix for all routes
  localePrefix: "always",
});

// Protected routes that require authentication
const protectedRoutes = [
  "/events/create",
  "/events/[id]/edit",
  "/my-events",
  "/my-registrations",
];

// Auth routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login", "/register"];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle OPTIONS preflight requests
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

  // Get the locale from the pathname
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Get the path without locale
  const pathWithoutLocale = pathnameLocale
    ? pathname.slice(`/${pathnameLocale}`.length)
    : pathname;

  // Check if user has a token (basic check)
  const token = request.cookies.get("auth_token")?.value;
  const isAuthenticated = !!token;

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) => {
    // Handle dynamic routes
    if (route.includes("[id]")) {
      const routePattern = route.replace("[id]", "[^/]+");
      const regex = new RegExp(`^${routePattern}$`);
      return regex.test(pathWithoutLocale);
    }
    return pathWithoutLocale.startsWith(route);
  });

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some((route) =>
    pathWithoutLocale.startsWith(route)
  );

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const locale = pathnameLocale || defaultLocale;
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to events page if accessing auth routes while authenticated
  if (isAuthRoute && isAuthenticated) {
    const locale = pathnameLocale || defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/events`, request.url));
  }

  // Continue with next-intl middleware
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(uk|en)/:path*"],
};
