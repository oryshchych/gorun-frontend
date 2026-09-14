import { Suspense } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default async function RegisterPage({
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
  // Preserve the post-auth redirect target when bouncing back to sign-in.
  const loginHref = redirect
    ? `/${locale}/login?redirect=${encodeURIComponent(redirect)}`
    : `/${locale}/login`;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("createAccountTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("createAccountSubtitle")}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <Suspense
            fallback={
              <div
                className="h-[420px] animate-pulse rounded-md bg-muted"
                aria-hidden
              />
            }
          >
            <RegisterForm />
          </Suspense>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {t("alreadyHaveAccount")}{" "}
            </span>
            <Link
              href={loginHref}
              className="font-medium text-primary hover:underline"
            >
              {t("signIn")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
