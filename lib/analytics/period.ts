import { format, subDays } from "date-fns";
import type { AnalyticsParams, AnalyticsPreset } from "@/types/analytics";

const PRESET_DAYS: Record<Exclude<AnalyticsPreset, "custom">, number> = {
  week: 7,
  month: 30,
  "3months": 90,
  year: 365,
};

const toISODate = (d: Date) => format(d, "yyyy-MM-dd");

/**
 * Resolve a preset (or explicit custom range) into the `{ from, to }` ISO date
 * strings the backend expects. Mirrors the backend's rolling-window logic so the
 * date inputs stay in sync with what the API computes.
 */
export function presetToRange(
  preset: AnalyticsPreset,
  custom?: { from?: string; to?: string },
  now: Date = new Date()
): { from: string; to: string } {
  if (preset === "custom" && custom?.from && custom?.to) {
    return { from: custom.from, to: custom.to };
  }
  const days =
    PRESET_DAYS[preset as Exclude<AnalyticsPreset, "custom">] ??
    PRESET_DAYS.month;
  return { from: toISODate(subDays(now, days)), to: toISODate(now) };
}

/** Build the query params object passed to the analytics hooks. */
export function buildAnalyticsParams(
  preset: AnalyticsPreset,
  custom: { from?: string; to?: string },
  eventId?: string
): AnalyticsParams {
  const base: AnalyticsParams = { preset };
  if (preset === "custom") {
    if (custom.from) base.from = custom.from;
    if (custom.to) base.to = custom.to;
  }
  if (eventId) base.eventId = eventId;
  return base;
}
