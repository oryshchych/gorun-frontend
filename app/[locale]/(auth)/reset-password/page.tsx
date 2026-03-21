import Link from "next/link";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import ResetPasswordClient from "./ResetPasswordClient";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  return (
    <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("resetPasswordTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("resetPasswordSubtitle")}
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex min-h-[30vh] items-center justify-center text-sm text-muted-foreground">
              {tCommon("loading")}
            </div>
          }
        >
          <ResetPasswordClient />
        </Suspense>

        <div className="text-center text-sm">
          <Link
            href={`/${locale}/login`}
            className="font-medium text-primary hover:underline"
          >
            {t("backToLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}
