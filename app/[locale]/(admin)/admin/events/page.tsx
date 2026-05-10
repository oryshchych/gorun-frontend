"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { uk } from "date-fns/locale/uk";
import { Loader2, Pencil } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { getLocalizedString } from "@/lib/utils";
import { handleApiError } from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/types/event";

function eventTitle(event: Event, locale: string): string {
  if (event.title?.trim()) return event.title.trim();
  const tr = event.translations?.title;
  if (tr) {
    const s = getLocalizedString(tr, locale, "en", "");
    if (s.trim()) return s.trim();
  }
  return event.id;
}

export default function AdminEventsListPage() {
  const locale = useLocale();
  const t = useTranslations("admin.events");
  const tForm = useTranslations("admin.eventForm");
  const tCommon = useTranslations("common");
  const tApi = useTranslations("apiCodes");
  const [page, setPage] = useState(1);
  const limit = 20;
  const dateLocale = locale === "uk" ? uk : enUS;

  const { data, isLoading, isError, error, refetch } = useEvents({
    page,
    limit,
    lang: locale,
  });

  useEffect(() => {
    if (isError && error) {
      handleApiError(error, t("loadError"), tApi);
    }
  }, [isError, error, t, tApi]);

  const rows = data?.data ?? [];
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
          <Link href={`/${locale}/admin/events/new`}>{t("create")}</Link>
        </Button>
      </div>

      <div className="mt-8 rounded-md border">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">{t("listEmpty")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="px-4 py-3 font-medium">{t("colTitle")}</th>
                  <th className="px-4 py-3 font-medium">{t("colDate")}</th>
                  <th className="px-4 py-3 font-medium">{t("colActive")}</th>
                  <th className="px-4 py-3 font-medium">{t("colStatus")}</th>
                  <th className="w-24 px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const title = eventTitle(row, locale);
                  const dateStr = format(new Date(row.date), "PP p", { locale: dateLocale });
                  const active = row.isActive !== false;
                  return (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="max-w-[220px] truncate px-4 py-3 font-medium" title={title}>
                        {title}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {dateStr}
                      </td>
                      <td className="px-4 py-3">
                        {active ? (
                          <Badge variant="default" className="font-normal">
                            {tForm("isActiveLabel")}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="font-normal">
                            {t("inactiveLabel")}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.status ? tForm(`status.${row.status}`) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            href={`/${locale}/admin/events/${row.id}/edit`}
                            aria-label={t("edit")}
                          >
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
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
