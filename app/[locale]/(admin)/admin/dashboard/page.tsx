"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import type { AnalyticsPreset } from "@/types/analytics";
import {
  useAnalyticsByEvent,
  useAnalyticsDemographics,
  useAnalyticsSummary,
  useAnalyticsTimeseries,
} from "@/hooks/useAnalytics";
import { buildAnalyticsParams } from "@/lib/analytics/period";
import { ShellPageHeader } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { ByEventTable } from "@/components/admin/analytics/ByEventTable";
import { ChartCard } from "@/components/admin/analytics/ChartCard";
import { KpiGrid } from "@/components/admin/analytics/KpiGrid";
import { PeriodFilter } from "@/components/admin/analytics/PeriodFilter";
import { RegistrationsByDayChart } from "@/components/admin/analytics/charts/RegistrationsByDayChart";
import { PaymentsByDayChart } from "@/components/admin/analytics/charts/PaymentsByDayChart";
import { RegsVsPaymentsChart } from "@/components/admin/analytics/charts/RegsVsPaymentsChart";
import { DemographicsCharts } from "@/components/admin/analytics/charts/DemographicsCharts";

const PRESETS: AnalyticsPreset[] = [
  "week",
  "month",
  "3months",
  "year",
  "custom",
];

function DashboardContent() {
  const t = useTranslations("admin.dashboard");
  const charts = useTranslations("admin.dashboard.charts");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const presetParam = searchParams.get("preset");
  const preset: AnalyticsPreset = PRESETS.includes(
    presetParam as AnalyticsPreset
  )
    ? (presetParam as AnalyticsPreset)
    : "month";
  const custom = {
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  };
  const eventId = searchParams.get("eventId") ?? undefined;

  const updateParams = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Custom range needs both dates before it is a valid query; until then fall
  // back to the month window so the dashboard keeps showing data.
  const ready = preset !== "custom" || Boolean(custom.from && custom.to);
  const effectivePreset = ready ? preset : "month";
  const effectiveCustom = ready ? custom : {};

  const scopedParams = buildAnalyticsParams(
    effectivePreset,
    effectiveCustom,
    eventId
  );
  const generalParams = buildAnalyticsParams(effectivePreset, effectiveCustom);

  const summary = useAnalyticsSummary(scopedParams);
  const timeseries = useAnalyticsTimeseries(scopedParams);
  const demographics = useAnalyticsDemographics(scopedParams);
  const byEvent = useAnalyticsByEvent(generalParams);

  const ts = timeseries.data;
  const selectedEvent = byEvent.data?.find((r) => r.eventId === eventId);
  const selectedTitle = selectedEvent
    ? ((locale === "uk" ? selectedEvent.titleUk : selectedEvent.titleEn) ??
      selectedEvent.title)
    : null;

  return (
    <div className="space-y-6">
      <ShellPageHeader
        title={t("title")}
        description={selectedTitle ?? t("subtitle")}
        actions={
          <PeriodFilter
            preset={preset}
            custom={custom}
            onPresetChange={(p) => updateParams({ preset: p })}
            onCustomChange={(c) => updateParams({ from: c.from, to: c.to })}
          />
        }
      />

      {eventId ? (
        <Button
          variant="soft"
          size="sm"
          onClick={() => updateParams({ eventId: undefined })}
        >
          <ArrowLeft className="size-4" />
          {t("scope.backToGeneral")}
        </Button>
      ) : null}

      <KpiGrid data={summary.data} isLoading={summary.isLoading} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title={charts("registrationsByDay")}
          isLoading={timeseries.isLoading}
          isError={timeseries.isError}
          isEmpty={!!ts && ts.registrationsByDay.length === 0}
        >
          {ts ? <RegistrationsByDayChart data={ts.registrationsByDay} /> : null}
        </ChartCard>
        <ChartCard
          title={charts("paymentsByDay")}
          isLoading={timeseries.isLoading}
          isError={timeseries.isError}
          isEmpty={!!ts && ts.paymentsByDay.length === 0}
        >
          {ts ? <PaymentsByDayChart data={ts.paymentsByDay} /> : null}
        </ChartCard>
      </div>

      <ChartCard
        title={charts("regsVsPayments")}
        isLoading={timeseries.isLoading}
        isError={timeseries.isError}
        isEmpty={!!ts && ts.combinedByDay.length === 0}
      >
        {ts ? <RegsVsPaymentsChart data={ts.combinedByDay} /> : null}
      </ChartCard>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-ink">
          {t("demographics.title")}
        </h2>
        <DemographicsCharts
          data={demographics.data}
          isLoading={demographics.isLoading}
          isError={demographics.isError}
        />
      </div>

      <ByEventTable
        rows={byEvent.data}
        isLoading={byEvent.isLoading}
        onSelectEvent={(id) => updateParams({ eventId: id })}
      />
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
