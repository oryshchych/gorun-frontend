"use client";

import { useLocale, useTranslations } from "next-intl";
import { format, parseISO } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { uk } from "date-fns/locale/uk";
import { Loader2 } from "lucide-react";
import {
  ShellTable,
  ShellTableBodyRow,
  ShellTableHeadRow,
  ShellTableScroll,
} from "@/components/layout/shell";
import type { ByEventRow } from "@/types/analytics";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/analytics/format";

interface ByEventTableProps {
  rows?: ByEventRow[];
  isLoading: boolean;
  onSelectEvent: (eventId: string) => void;
}

export function ByEventTable({
  rows,
  isLoading,
  onSelectEvent,
}: ByEventTableProps) {
  const t = useTranslations("admin.dashboard.table");
  const locale = useLocale();
  const dateLocale = locale === "uk" ? uk : enUS;

  const eventTitle = (row: ByEventRow) =>
    ((locale === "uk" ? row.titleUk : row.titleEn) ?? row.title) || "—";

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-ink">{t("title")}</h3>
      <ShellTable>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2
              className="size-7 animate-spin shell-ink-muted"
              aria-hidden
            />
          </div>
        ) : !rows || rows.length === 0 ? (
          <p className="py-10 text-center shell-ink-muted">{t("title")}</p>
        ) : (
          <ShellTableScroll>
            <table className="shell-table w-full text-sm">
              <thead>
                <ShellTableHeadRow>
                  <th className="px-4 py-3 font-medium">{t("event")}</th>
                  <th className="px-4 py-3 font-medium">{t("date")}</th>
                  <th className="px-4 py-3 font-medium">
                    {t("registrations")}
                  </th>
                  <th className="px-4 py-3 font-medium">{t("paid")}</th>
                  <th className="px-4 py-3 font-medium">{t("conversion")}</th>
                  <th className="px-4 py-3 font-medium">{t("revenue")}</th>
                  <th className="px-4 py-3 font-medium">{t("capacityFill")}</th>
                </ShellTableHeadRow>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <ShellTableBodyRow
                    key={row.eventId}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer"
                    onClick={() => onSelectEvent(row.eventId)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectEvent(row.eventId);
                      }
                    }}
                  >
                    <td className="px-4 py-3 font-medium">{eventTitle(row)}</td>
                    <td className="px-4 py-3 shell-ink-muted">
                      {row.date
                        ? format(parseISO(row.date), "d MMM yyyy", {
                            locale: dateLocale,
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 shell-ink-muted">
                      {formatNumber(row.registrations)}
                    </td>
                    <td className="px-4 py-3 shell-ink-muted">
                      {formatNumber(row.paid)}
                    </td>
                    <td className="px-4 py-3 shell-ink-muted">
                      {formatPercent(row.conversionRate)}
                    </td>
                    <td className="px-4 py-3 shell-ink-muted">
                      {formatCurrency(row.revenue)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-2">
                          <div
                            className="h-full rounded-full bg-brand"
                            style={{
                              width: `${Math.min(100, row.capacityFillPct * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs shell-ink-muted">
                          {formatPercent(row.capacityFillPct)}
                        </span>
                      </div>
                    </td>
                  </ShellTableBodyRow>
                ))}
              </tbody>
            </table>
          </ShellTableScroll>
        )}
      </ShellTable>
    </div>
  );
}
