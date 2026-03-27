"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { PromoCodeForm } from "@/components/admin/PromoCodeForm";
import { getAdminPromoCodeById } from "@/lib/api/admin-promo-codes";

export default function AdminEditPromoCodePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("admin.promoCodes");

  const { data: promo, isLoading, isError } = useQuery({
    queryKey: ["admin", "promo-code", id],
    queryFn: () => getAdminPromoCodeById(id),
  });

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">{t("edit")}</h1>
      <div className="mt-8">
        {isError ? (
          <p className="text-destructive">{t("loadError")}</p>
        ) : (
          <PromoCodeForm
            mode="edit"
            promoId={id}
            initial={promo ?? null}
            isLoadingInitial={isLoading}
          />
        )}
      </div>
    </div>
  );
}
