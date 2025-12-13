import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useLocale, useTranslations } from "next-intl";

export default function RegisterPage() {
  const locale = useLocale();
  const t = useTranslations("auth");

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">{t("createAccountTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("createAccountSubtitle")}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <RegisterForm />

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{t("alreadyHaveAccount")} </span>
            <Link href={`/${locale}/login`} className="font-medium text-primary hover:underline">
              {t("signIn")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
