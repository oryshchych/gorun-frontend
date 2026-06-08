"use client";

import { useTranslations } from "next-intl";
import type { AnalyticsPreset } from "@/types/analytics";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PRESETS: { value: AnalyticsPreset; labelKey: string }[] = [
  { value: "week", labelKey: "week" },
  { value: "month", labelKey: "month" },
  { value: "3months", labelKey: "threeMonths" },
  { value: "year", labelKey: "year" },
  { value: "custom", labelKey: "custom" },
];

interface PeriodFilterProps {
  preset: AnalyticsPreset;
  custom: { from?: string; to?: string };
  onPresetChange: (preset: AnalyticsPreset) => void;
  onCustomChange: (custom: { from?: string; to?: string }) => void;
}

export function PeriodFilter({
  preset,
  custom,
  onPresetChange,
  onCustomChange,
}: PeriodFilterProps) {
  const t = useTranslations("admin.dashboard.period");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap items-center gap-1 rounded-[var(--r-pill)] border border-line bg-surface p-1">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onPresetChange(p.value)}
            className={cn(
              "rounded-[var(--r-pill)] px-3 py-1.5 text-sm font-medium transition-colors",
              preset === p.value
                ? "bg-brand text-on-brand"
                : "text-ink-2 hover:bg-surface-2"
            )}
          >
            {t(p.labelKey)}
          </button>
        ))}
      </div>

      {preset === "custom" ? (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            aria-label={t("from")}
            value={custom.from ?? ""}
            max={custom.to}
            onChange={(e) =>
              onCustomChange({ ...custom, from: e.target.value })
            }
            className="h-9 w-auto"
          />
          <span className="text-ink-3">—</span>
          <Input
            type="date"
            aria-label={t("to")}
            value={custom.to ?? ""}
            min={custom.from}
            onChange={(e) => onCustomChange({ ...custom, to: e.target.value })}
            className="h-9 w-auto"
          />
        </div>
      ) : null}
    </div>
  );
}
