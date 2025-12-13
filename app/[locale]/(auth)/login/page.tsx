import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { useLocale, useTranslations } from "next-intl";

export default function LoginPage() {
  const locale = useLocale();
  const t = useTranslations("auth");

  return (
    <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("signInTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("signInSubtitle")}</p>
        </div>

        <div className="rounded-lg border bg-card p-6 sm:p-8 shadow-sm">
          <LoginForm />

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{t("dontHaveAccount")} </span>
            <Link
              href={`/${locale}/register`}
              className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
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
