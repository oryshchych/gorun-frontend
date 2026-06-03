"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { use } from "react";
import { ArrowLeft } from "lucide-react";
import { PromoCodeForm } from "@/components/admin/PromoCodeForm";
import { ShellPageHeader } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { useAdminPromoCode } from "@/hooks/useAdminPromoCodes";

export default function AdminEditPromoCodePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = use(params);
  const locale = useLocale();
  const t = useTranslations("admin.promoCodes");
  const tCommon = useTranslations("common");

  const { data: promo, isLoading, isError } = useAdminPromoCode(id);

  return (
    <>
      <Button variant="ghost" asChild className="mb-4 -ml-2">
        <Link href={`/${locale}/admin/promo-codes`}>
          <ArrowLeft className="mr-2 size-4" />
          {tCommon("back")}
        </Link>
      </Button>

      <ShellPageHeader title={t("edit")} className="mb-6" />

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
    </>
  );
}
