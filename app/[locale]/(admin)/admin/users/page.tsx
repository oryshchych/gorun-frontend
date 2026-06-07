"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Download, Loader2, Search } from "lucide-react";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useDebounce } from "@/hooks/useDebounce";
import { exportAdminUsersCsv } from "@/lib/api/admin-users";
import { handleApiError } from "@/lib/error-handler";
import {
  ShellPageHeader,
  ShellTable,
  ShellTableBodyRow,
  ShellTableHeadRow,
  ShellTableScroll,
} from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserDetailModal } from "@/components/admin/UserDetailModal";
import type { AdminUserSource } from "@/types/user";

const USERS_LIST_LIMIT = 20;

export default function AdminUsersListPage() {
  const t = useTranslations("admin.users");
  const tCommon = useTranslations("common");
  const tApi = useTranslations("apiCodes");

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [source, setSource] = useState<AdminUserSource>("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, isLoading, isError, error, refetch } = useAdminUsers({
    page,
    limit: USERS_LIST_LIMIT,
    search: debouncedSearch || undefined,
    source,
  });

  useEffect(() => {
    if (isError && error) {
      handleApiError(error, t("loadError"), tApi);
    }
  }, [isError, error, t, tApi]);

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const hasActiveFilters = debouncedSearch !== "" || source !== "all";

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportAdminUsersCsv({
        search: debouncedSearch || undefined,
        source,
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
          value={source}
          onValueChange={(v: AdminUserSource) => {
            setSource(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[min(100%,220px)]">
            <SelectValue placeholder={t("filterAllSources")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filterAllSources")}</SelectItem>
            <SelectItem value="registered">{t("filterRegistered")}</SelectItem>
            <SelectItem value="app_only">{t("filterAppOnly")}</SelectItem>
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
            {hasActiveFilters ? t("noFilterResults") : t("listEmpty")}
          </p>
        ) : (
          <ShellTableScroll>
            <table className="shell-table w-full text-sm">
              <thead>
                <ShellTableHeadRow>
                  <th className="px-4 py-3 font-medium">{t("colName")}</th>
                  <th className="px-4 py-3 font-medium">{t("colPhone")}</th>
                  <th className="px-4 py-3 font-medium">{t("colEmail")}</th>
                  <th className="px-4 py-3 font-medium">
                    {t("colRegistrations")}
                  </th>
                </ShellTableHeadRow>
              </thead>
              <tbody>
                {items.map((row) => (
                  <ShellTableBodyRow
                    key={row.id}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer"
                    onClick={() => setSelectedUserId(row.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedUserId(row.id);
                      }
                    }}
                  >
                    <td className="px-4 py-3 font-medium">{row.fullName}</td>
                    <td className="px-4 py-3 shell-ink-muted">
                      {row.phone ?? "—"}
                    </td>
                    <td className="max-w-[260px] truncate px-4 py-3">
                      {row.email}
                    </td>
                    <td className="px-4 py-3 shell-ink-muted">
                      {row.registrationsCount}
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

      <UserDetailModal
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </>
  );
}
