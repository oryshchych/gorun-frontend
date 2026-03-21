"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("auth");
  const token = searchParams.get("token");

  if (!token) {
    return (
      <div className="rounded-lg border bg-card p-6 sm:p-8 shadow-sm text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          {t("resetPasswordInvalidToken")}
        </p>
        <Link
          href={`/${locale}/forgot-password`}
          className="inline-block font-medium text-primary hover:underline"
        >
          {t("sendResetLink")}
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6 sm:p-8 shadow-sm">
      <ResetPasswordForm token={token} />
    </div>
  );
}
