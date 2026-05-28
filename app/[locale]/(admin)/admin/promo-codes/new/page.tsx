"use client";

import { useTranslations } from "next-intl";
import { PromoCodeForm } from "@/components/admin/PromoCodeForm";
import { ShellPageHeader } from "@/components/layout/shell";

export default function AdminNewPromoCodePage() {
  const t = useTranslations("admin.promoCodes");

  return (
    <>
      <ShellPageHeader title={t("create")} className="mb-6" />
      <PromoCodeForm mode="create" />
    </>
  );
}
