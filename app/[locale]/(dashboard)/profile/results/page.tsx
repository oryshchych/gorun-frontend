"use client";

import { useTranslations } from "next-intl";
import { ShellPageHeader } from "@/components/layout/shell";

export default function ProfileResultsPage() {
  const t = useTranslations("profile");

  return (
    <>
      <ShellPageHeader
        title={t("resultsTitle")}
        description={t("resultsSubtitle")}
        className="mb-6"
      />
      <div className="shell-surface rounded-lg border p-6 shadow-sm md:p-8">
        <p className="text-sm shell-ink-muted">{t("resultsPlaceholder")}</p>
      </div>
    </>
  );
}
