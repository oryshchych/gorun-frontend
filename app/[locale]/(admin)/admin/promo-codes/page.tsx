"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { getAdminPromoCodes } from "@/lib/api/admin-promo-codes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { handleApiError } from "@/lib/error-handler";

export default function AdminPromoCodesListPage() {
  const locale = useLocale();
  const t = useTranslations("admin.promoCodes");
  const tCommon = useTranslations("common");
  const tApi = useTranslations("apiCodes");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "promo-codes", page, limit],
    queryFn: () => getAdminPromoCodes({ page, limit }),
  });

  useEffect(() => {
    if (isError && error) {
      handleApiError(error, t("loadError"), tApi);
    }
  }, [isError, error, t, tApi]);

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("description")}</p>
        </div>
        <Button asChild>
          <Link href={`/${locale}/admin/promo-codes/new`}>{t("create")}</Link>
        </Button>
      </div>

      <div className="mt-8 rounded-md border">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">{t("listEmpty")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="px-4 py-3 font-medium">{t("codeLabel")}</th>
                  <th className="px-4 py-3 font-medium">{t("discountTypeLabel")}</th>
                  <th className="px-4 py-3 font-medium">{t("discountValueLabel")}</th>
                  <th className="px-4 py-3 font-medium">{t("isActiveLabel")}</th>
                  <th className="px-4 py-3 font-medium">{t("usageLimitLabel")}</th>
                  <th className="px-4 py-3 font-medium">{t("expirationLabel")}</th>
                  <th className="w-24 px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-mono">{row.code}</td>
                    <td className="px-4 py-3 capitalize">{row.discountType}</td>
                    <td className="px-4 py-3">
                      {row.discountType === "percentage"
                        ? `${row.discountValue}%`
                        : row.discountValue}
                    </td>
                    <td className="px-4 py-3">
                      {row.isActive ? (
                        <Badge variant="default" className="font-normal">
                          {t("isActiveLabel")}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="font-normal">
                          {t("inactiveLabel")}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.usedCount != null ? `${row.usedCount} / ` : ""}
                      {row.usageLimit ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.expirationDate
                        ? row.expirationDate.slice(0, 10)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="icon" asChild>
                        <Link
                          href={`/${locale}/admin/promo-codes/${row.id}/edit`}
                          aria-label={t("edit")}
                        >
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {t("page", { current: pagination.page, total: totalPages })}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t("prev")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              {t("next")}
            </Button>
          </div>
        </div>
      )}

      {isError && (
        <div className="mt-4">
          <Button type="button" variant="outline" onClick={() => refetch()}>
            {tCommon("retry")}
          </Button>
        </div>
      )}
    </div>
  );
}
