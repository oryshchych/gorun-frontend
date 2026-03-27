"use client";

import { useTranslations } from "next-intl";

export default function AdminEventsPage() {
  const t = useTranslations("admin.events");

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("placeholder")}</p>
    </div>
  );
}
