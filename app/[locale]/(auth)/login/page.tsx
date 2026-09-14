import { Suspense } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ redirect?: string | string[] }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  const sp = await searchParams;
  const redirect = typeof sp.redirect === "string" ? sp.redirect : undefined;
  // Preserve the post-auth redirect target when bouncing to sign-up.
  const registerHref = redirect
    ? `/${locale}/register?redirect=${encodeURIComponent(redirect)}`
    : `/${locale}/register`;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("signInTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("signInSubtitle")}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 sm:p-8 shadow-sm">
          <Suspense
            fallback={
              <div
                className="h-[280px] animate-pulse rounded-md bg-muted"
                aria-hidden
              />
            }
          >
            <LoginForm />
          </Suspense>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {t("dontHaveAccount")}{" "}
            </span>
            <Link
              href={registerHref}
              className="font-bold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              aria-label="Sign up for a new account"
            >
              {t("signUp")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
