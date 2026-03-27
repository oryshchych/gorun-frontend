"use client";

import { useTranslations } from "next-intl";
import { PromoCodeForm } from "@/components/admin/PromoCodeForm";

export default function AdminNewPromoCodePage() {
  const t = useTranslations("admin.promoCodes");

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">{t("create")}</h1>
      <div className="mt-8">
        <PromoCodeForm mode="create" />
      </div>
    </div>
  );
}
