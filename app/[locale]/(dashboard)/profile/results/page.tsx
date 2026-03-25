"use client";

import { useTranslations } from "next-intl";

export default function ProfileResultsPage() {
  const t = useTranslations("profile");

  return (
    <div className="rounded-lg border bg-card p-8 shadow-sm">
      <h1 className="text-3xl font-bold mb-2">{t("resultsTitle")}</h1>
      <p className="text-muted-foreground mb-6">{t("resultsSubtitle")}</p>
      <p className="text-sm text-muted-foreground">{t("resultsPlaceholder")}</p>
    </div>
  );
}
