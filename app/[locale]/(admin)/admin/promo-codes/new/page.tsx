"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { PromoCodeForm } from "@/components/admin/PromoCodeForm";
import { ShellPageHeader } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";

export default function AdminNewPromoCodePage() {
  const locale = useLocale();
  const t = useTranslations("admin.promoCodes");
  const tCommon = useTranslations("common");

  return (
    <>
      <Button variant="ghost" asChild className="mb-4 -ml-2">
        <Link href={`/${locale}/admin/promo-codes`}>
          <ArrowLeft className="mr-2 size-4" />
          {tCommon("back")}
        </Link>
      </Button>

      <ShellPageHeader title={t("create")} className="mb-6" />
      <PromoCodeForm mode="create" />
    </>
  );
}
