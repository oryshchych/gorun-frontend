"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { getAdminPromoCodes } from "@/lib/api/admin-promo-codes";
import { ShellPageHeader, ShellTable, ShellTableHeadRow, ShellTableScroll } from "@/components/layout/shell";
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
    <>
      <ShellPageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button asChild>
            <Link href={`/${locale}/admin/promo-codes/new`}>{t("create")}</Link>
          </Button>
        }
      />

      <ShellTable>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-8 animate-spin shell-ink-muted" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-12 text-center shell-ink-muted">{t("listEmpty")}</p>
        ) : (
          <ShellTableScroll>
            <table className="w-full text-sm">
              <thead>
                <ShellTableHeadRow>
                  <th className="px-4 py-3 font-medium">{t("codeLabel")}</th>
                  <th className="px-4 py-3 font-medium">{t("discountTypeLabel")}</th>
                  <th className="px-4 py-3 font-medium">{t("discountValueLabel")}</th>
                  <th className="px-4 py-3 font-medium">{t("isActiveLabel")}</th>
                  <th className="px-4 py-3 font-medium">{t("usageLimitLabel")}</th>
                  <th className="px-4 py-3 font-medium">{t("expirationLabel")}</th>
                  <th className="w-24 px-4 py-3 font-medium" />
                </ShellTableHeadRow>
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
                    <td className="px-4 py-3 shell-ink-muted">
                      {row.usedCount != null ? `${row.usedCount} / ` : ""}
                      {row.usageLimit ?? "—"}
                    </td>
                    <td className="px-4 py-3 shell-ink-muted">
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
          </ShellTableScroll>
        )}
      </ShellTable>

      {pagination && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-sm shell-ink-muted">
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
    </>
  );
}
