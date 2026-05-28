"use client";

import { useTranslations } from "next-intl";
import { ShellPageHeader } from "@/components/layout/shell";

export default function AdminDashboardPage() {
  const t = useTranslations("admin.dashboard");

  return (
    <>
      <ShellPageHeader title={t("title")} description={t("placeholder")} />
    </>
  );
}
