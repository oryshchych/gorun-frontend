"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAdminPromoCodes } from "@/hooks/useAdminPromoCodes";
import { useDebounce } from "@/hooks/useDebounce";
import { PromoCodeForm } from "@/components/admin/PromoCodeForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShellTable,
  ShellTableBodyRow,
  ShellTableHeadRow,
  ShellTableScroll,
} from "@/components/layout/shell";
import { handleApiError } from "@/lib/error-handler";
import type { AdminPromoCode } from "@/types/promo-code";

const TAB_LIMIT = 10;

type DialogState =
  | { mode: "create" }
  | { mode: "edit"; promo: AdminPromoCode }
  | null;

export function EventPromoCodesTab({ eventId }: { eventId: string }) {
  const t = useTranslations("admin.promoCodes");
  const tCommon = useTranslations("common");
  const tApi = useTranslations("apiCodes");

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [dialog, setDialog] = useState<DialogState>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const isActiveParam =
    statusFilter === "active"
      ? true
      : statusFilter === "inactive"
        ? false
        : undefined;

  const { data, isLoading, isError, error, refetch } = useAdminPromoCodes({
    page,
    limit: TAB_LIMIT,
    search: debouncedSearch || undefined,
    isActive: isActiveParam,
    eventId,
  });

  useEffect(() => {
    if (isError && error) {
      handleApiError(error, t("loadError"), tApi);
    }
  }, [isError, error, t, tApi]);

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  const hasActiveFilters = debouncedSearch !== "" || statusFilter !== "all";

  const closeDialog = () => setDialog(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 shell-ink-muted"
            aria-hidden
          />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder={t("searchPlaceholder")}
            className="pl-9"
            aria-label={t("searchPlaceholder")}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v: "all" | "active" | "inactive") => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[min(100%,180px)]">
            <SelectValue placeholder={t("filterAllStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filterAllStatuses")}</SelectItem>
            <SelectItem value="active">{t("filterActive")}</SelectItem>
            <SelectItem value="inactive">{t("filterInactive")}</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="button"
          size="sm"
          onClick={() => setDialog({ mode: "create" })}
        >
          <Plus className="mr-1 size-4" aria-hidden />
          {t("create")}
        </Button>
      </div>

      <ShellTable>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-8 animate-spin shell-ink-muted" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-12 text-center shell-ink-muted">
            {hasActiveFilters ? t("noFilterResults") : t("listEmpty")}
          </p>
        ) : (
          <ShellTableScroll>
            <table className="shell-table w-full text-sm">
              <thead>
                <ShellTableHeadRow>
                  <th className="px-4 py-3 font-medium">{t("codeLabel")}</th>
                  <th className="px-4 py-3 font-medium">
                    {t("discountValueLabel")}
                  </th>
                  <th className="px-4 py-3 font-medium">{t("status")}</th>
                  <th className="px-4 py-3 font-medium">
                    {t("usageLimitLabel")}
                  </th>
                  <th className="px-4 py-3 font-medium">
                    {t("expirationLabel")}
                  </th>
                  <th className="w-16 px-4 py-3 font-medium" />
                </ShellTableHeadRow>
              </thead>
              <tbody>
                {items.map((row) => (
                  <ShellTableBodyRow key={row.id}>
                    <td className="px-4 py-3 font-mono">{row.code}</td>
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={t("edit")}
                        onClick={() => setDialog({ mode: "edit", promo: row })}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </td>
                  </ShellTableBodyRow>
                ))}
              </tbody>
            </table>
          </ShellTableScroll>
        )}
      </ShellTable>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
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
        <Button type="button" variant="outline" onClick={() => refetch()}>
          {tCommon("retry")}
        </Button>
      )}

      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialog?.mode === "edit" ? t("edit") : t("create")}
            </DialogTitle>
          </DialogHeader>
          {dialog?.mode === "create" && (
            <PromoCodeForm
              mode="create"
              fixedEventId={eventId}
              onSuccess={closeDialog}
            />
          )}
          {dialog?.mode === "edit" && (
            <PromoCodeForm
              mode="edit"
              promoId={dialog.promo.id}
              initial={dialog.promo}
              fixedEventId={eventId}
              onSuccess={closeDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
