"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Download, Loader2, Search } from "lucide-react";
import { useAdminRegistrations } from "@/hooks/useAdminRegistrations";
import { useDebounce } from "@/hooks/useDebounce";
import { exportAdminRegistrationsCsv } from "@/lib/api/admin-registrations";
import { handleApiError } from "@/lib/error-handler";
import {
  ShellPageHeader,
  ShellTable,
  ShellTableBodyRow,
  ShellTableHeadRow,
  ShellTableScroll,
} from "@/components/layout/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RegistrationDetailModal } from "@/components/admin/RegistrationDetailModal";
import type {
  AdminPaymentStatus,
  AdminRegistrationStatus,
} from "@/types/registration";

const REGISTRATIONS_LIST_LIMIT = 20;

type StatusFilter = "all" | AdminRegistrationStatus;
type PayStatusFilter = "all" | AdminPaymentStatus;

function statusVariant(
  status: AdminRegistrationStatus
): "secondary" | "outline" | "destructive" {
  if (status === "confirmed") return "secondary";
  if (status === "cancelled") return "destructive";
  return "outline";
}

function payVariant(
  status: AdminPaymentStatus
): "secondary" | "outline" | "destructive" {
  if (status === "completed") return "secondary";
  if (status === "failed" || status === "refunded") return "destructive";
  return "outline";
}

export default function AdminRegistrationsListPage() {
  const t = useTranslations("admin.registrations");
  const tCommon = useTranslations("common");
  const tApi = useTranslations("apiCodes");

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [paymentStatus, setPaymentStatus] = useState<PayStatusFilter>("all");
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<
    string | null
  >(null);
  const [isExporting, setIsExporting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, isLoading, isError, error, refetch } = useAdminRegistrations({
    page,
    limit: REGISTRATIONS_LIST_LIMIT,
    search: debouncedSearch || undefined,
    status: status !== "all" ? status : undefined,
    paymentStatus: paymentStatus !== "all" ? paymentStatus : undefined,
  });

  useEffect(() => {
    if (isError && error) {
      handleApiError(error, t("loadError"), tApi);
    }
  }, [isError, error, t, tApi]);

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportAdminRegistrationsCsv({
        search: debouncedSearch || undefined,
        status: status !== "all" ? status : undefined,
        paymentStatus: paymentStatus !== "all" ? paymentStatus : undefined,
      });
    } catch (err) {
      handleApiError(err, t("exportError"), tApi);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <ShellPageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={handleExport}
            disabled={isExporting || items.length === 0}
          >
            {isExporting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Download className="size-4" aria-hidden />
            )}
            {t("exportCsv")}
          </Button>
        }
      />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
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
          value={status}
          onValueChange={(v: StatusFilter) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[min(100%,200px)]">
            <SelectValue placeholder={t("filterStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filterStatus")}</SelectItem>
            <SelectItem value="pending">{t("filterStatusPending")}</SelectItem>
            <SelectItem value="confirmed">
              {t("filterStatusConfirmed")}
            </SelectItem>
            <SelectItem value="cancelled">
              {t("filterStatusCancelled")}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={paymentStatus}
          onValueChange={(v: PayStatusFilter) => {
            setPaymentStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[min(100%,200px)]">
            <SelectValue placeholder={t("filterPaymentStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filterPaymentStatus")}</SelectItem>
            <SelectItem value="pending">{t("filterPayPending")}</SelectItem>
            <SelectItem value="completed">{t("filterPayCompleted")}</SelectItem>
            <SelectItem value="failed">{t("filterPayFailed")}</SelectItem>
            <SelectItem value="refunded">{t("filterPayRefunded")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ShellTable className="mt-4">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2
              className="size-8 animate-spin shell-ink-muted"
              aria-hidden
            />
          </div>
        ) : items.length === 0 ? (
          <p className="py-12 text-center shell-ink-muted">
            {searchQuery || status !== "all" || paymentStatus !== "all"
              ? t("noFilterResults")
              : t("listEmpty")}
          </p>
        ) : (
          <ShellTableScroll>
            <table className="shell-table w-full text-sm">
              <thead>
                <ShellTableHeadRow>
                  <th className="px-4 py-3 font-medium">{t("colName")}</th>
                  <th className="px-4 py-3 font-medium">{t("colEvent")}</th>
                  <th className="px-4 py-3 font-medium">{t("colDistance")}</th>
                  <th className="px-4 py-3 font-medium">{t("colBib")}</th>
                  <th className="px-4 py-3 font-medium">{t("colAmount")}</th>
                  <th className="px-4 py-3 font-medium">{t("colPayStatus")}</th>
                  <th className="px-4 py-3 font-medium">{t("colStatus")}</th>
                </ShellTableHeadRow>
              </thead>
              <tbody>
                {items.map((row) => (
                  <ShellTableBodyRow
                    key={row.id}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer"
                    onClick={() => setSelectedRegistrationId(row.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedRegistrationId(row.id);
                      }
                    }}
                  >
                    <td className="px-4 py-3 font-medium">{row.fullName}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 shell-ink-muted">
                      {row.eventName ?? "—"}
                    </td>
                    <td className="px-4 py-3 shell-ink-muted">
                      {row.distanceLabel ?? "—"}
                    </td>
                    <td className="px-4 py-3 shell-ink-muted">
                      {row.bib ?? t("noBib")}
                    </td>
                    <td className="px-4 py-3 shell-ink-muted">
                      {row.finalPrice != null ? `${row.finalPrice} UAH` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={payVariant(row.paymentStatus)}>
                        {t(`payStatus_${row.paymentStatus}`)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(row.status)}>
                        {t(`regStatus_${row.status}`)}
                      </Badge>
                    </td>
                  </ShellTableBodyRow>
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

      <RegistrationDetailModal
        registrationId={selectedRegistrationId}
        onClose={() => setSelectedRegistrationId(null)}
      />
    </>
  );
}
