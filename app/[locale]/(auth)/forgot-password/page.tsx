import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { getTranslations } from "next-intl/server";

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("forgotPasswordTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("forgotPasswordSubtitle")}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 sm:p-8 shadow-sm">
          <ForgotPasswordForm />
          <div className="mt-6 text-center text-sm">
            <Link
              href={`/${locale}/login`}
              className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
            >
              {t("backToLogin")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
