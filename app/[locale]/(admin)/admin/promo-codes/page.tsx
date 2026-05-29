"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Search } from "lucide-react";
import { getAdminPromoCodes } from "@/lib/api/admin-promo-codes";
import { getEvents } from "@/lib/api/events";
import { useDebounce } from "@/hooks/useDebounce";
import {
  ShellPageHeader,
  ShellTable,
  ShellTableBodyRow,
  ShellTableHeadRow,
  ShellTableScroll,
} from "@/components/layout/shell";
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
import { handleApiError } from "@/lib/error-handler";
import { getLocalizedString } from "@/lib/utils";
import type { Event } from "@/types/event";
import type { AdminPromoCode } from "@/types/promo-code";

const PROMO_LIST_LIMIT = 20;

function eventDisplayName(event: Event, locale: string): string {
  if (event.title?.trim()) return event.title.trim();
  const tr = event.translations?.title;
  if (tr) return getLocalizedString(tr, locale) || event.id;
  return event.id;
}

function promoEventName(
  row: AdminPromoCode,
  eventNameById: Map<string, string>
): string {
  return eventNameById.get(row.eventId) ?? row.eventId;
}

export default function AdminPromoCodesListPage() {
  const locale = useLocale();
  const t = useTranslations("admin.promoCodes");
  const tCommon = useTranslations("common");
  const tApi = useTranslations("apiCodes");

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventFilterId, setEventFilterId] = useState("all");

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      "admin",
      "promo-codes",
      "list",
      { page, limit: PROMO_LIST_LIMIT, search: debouncedSearch, eventId: eventFilterId },
    ],
    queryFn: () =>
      getAdminPromoCodes({
        page,
        limit: PROMO_LIST_LIMIT,
        search: debouncedSearch || undefined,
        eventId: eventFilterId === "all" ? undefined : eventFilterId,
      }),
  });

  const { data: eventsResult } = useQuery({
    queryKey: ["admin", "promo-codes-events", locale],
    queryFn: () => getEvents({ limit: 100, lang: locale }),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (isError && error) {
      handleApiError(error, t("loadError"), tApi);
    }
  }, [isError, error, t, tApi]);

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  const events = useMemo<Event[]>(
    () => eventsResult?.data ?? [],
    [eventsResult?.data]
  );

  const eventNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const event of events) {
      map.set(event.id, eventDisplayName(event, locale));
    }
    return map;
  }, [events, locale]);

  const eventFilterOptions = useMemo(
    () =>
      [...events]
        .map((event) => ({
          id: event.id,
          label: eventDisplayName(event, locale),
        }))
        .sort((a, b) => a.label.localeCompare(b.label, locale)),
    [events, locale]
  );

  const hasActiveFilters = debouncedSearch !== "" || eventFilterId !== "all";

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
          value={eventFilterId}
          onValueChange={(v) => {
            setEventFilterId(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[min(100%,280px)]">
            <SelectValue placeholder={t("filterAllEvents")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filterAllEvents")}</SelectItem>
            {eventFilterOptions.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ShellTable className="mt-4">
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
                  <th className="px-4 py-3 font-medium">{t("eventLabel")}</th>
                  <th className="px-4 py-3 font-medium">
                    {t("discountValueLabel")}
                  </th>
                  <th className="px-4 py-3 font-medium">
                    {t("isActiveLabel")}
                  </th>
                  <th className="px-4 py-3 font-medium">
                    {t("usageLimitLabel")}
                  </th>
                  <th className="px-4 py-3 font-medium">
                    {t("expirationLabel")}
                  </th>
                  <th className="w-24 px-4 py-3 font-medium" />
                </ShellTableHeadRow>
              </thead>
              <tbody>
                {items.map((row) => (
                  <ShellTableBodyRow key={row.id}>
                    <td className="px-4 py-3 font-mono">{row.code}</td>
                    <td
                      className="max-w-[220px] truncate px-4 py-3"
                      title={promoEventName(row, eventNameById)}
                    >
                      {promoEventName(row, eventNameById)}
                    </td>
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
    </>
  );
}
