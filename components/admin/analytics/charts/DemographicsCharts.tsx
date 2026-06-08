"use client";

import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Bucket, DemographicsResponse } from "@/types/analytics";
import {
  CHART_AXIS_COLOR,
  CHART_COLORS,
  CHART_GRID_COLOR,
  tooltipStyle,
} from "@/lib/analytics/format";
import { ChartCard } from "../ChartCard";

interface DemographicsChartsProps {
  data?: DemographicsResponse;
  isLoading: boolean;
  isError: boolean;
}

function BucketPie({ data }: { data: Bucket[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="label"
          cx="50%"
          cy="50%"
          outerRadius="80%"
          label={(entry) => entry.name ?? ""}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function BucketBar({
  data,
  horizontal = false,
  color = "var(--brand)",
}: {
  data: Bucket[];
  horizontal?: boolean;
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 8, right: 12, bottom: 0, left: horizontal ? 8 : -16 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
        {horizontal ? (
          <>
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }}
              stroke={CHART_GRID_COLOR}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={90}
              tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }}
              stroke={CHART_GRID_COLOR}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }}
              stroke={CHART_GRID_COLOR}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }}
              stroke={CHART_GRID_COLOR}
            />
          </>
        )}
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "var(--surface-2)" }}
        />
        <Bar
          dataKey="count"
          fill={color}
          radius={horizontal ? [0, 3, 3, 0] : [3, 3, 0, 0]}
          maxBarSize={36}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DemographicsCharts({
  data,
  isLoading,
  isError,
}: DemographicsChartsProps) {
  const t = useTranslations("admin.dashboard.demographics");

  const localizeBucket = (b: Bucket): Bucket => ({
    ...b,
    label: b.label === "unknown" ? t("unknown") : b.label,
  });

  const gender = (data?.gender ?? []).map((b) => ({
    label: t(`genderLabels.${b.label}` as "genderLabels.unknown"),
    count: b.count,
  }));
  const age = (data?.ageCategory ?? []).map(localizeBucket);
  const kidAges = (data?.kidAgeBuckets ?? []).map(localizeBucket);
  const adultsVsKids: Bucket[] = data
    ? [
        { label: t("adults"), count: data.adultsVsKids.adults },
        { label: t("kids"), count: data.adultsVsKids.kids },
      ]
    : [];
  const promo: Bucket[] = data
    ? [
        { label: t("withPromo"), count: data.promoUsage.withPromo },
        { label: t("withoutPromo"), count: data.promoUsage.withoutPromo },
      ]
    : [];

  const empty = (arr: Bucket[]) => !isLoading && !isError && arr.length === 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <ChartCard
        title={t("gender")}
        isLoading={isLoading}
        isError={isError}
        isEmpty={empty(gender)}
        bodyClassName="h-64"
      >
        <BucketPie data={gender} />
      </ChartCard>
      <ChartCard
        title={t("ageCategory")}
        isLoading={isLoading}
        isError={isError}
        isEmpty={empty(age)}
        bodyClassName="h-64"
      >
        <BucketBar data={age} />
      </ChartCard>
      <ChartCard
        title={t("adultsVsKids")}
        isLoading={isLoading}
        isError={isError}
        isEmpty={empty(adultsVsKids)}
        bodyClassName="h-64"
      >
        <BucketPie data={adultsVsKids} />
      </ChartCard>
      <ChartCard
        title={t("topCities")}
        isLoading={isLoading}
        isError={isError}
        isEmpty={empty(data?.topCities ?? [])}
        bodyClassName="h-64"
      >
        <BucketBar
          data={data?.topCities ?? []}
          horizontal
          color="var(--info)"
        />
      </ChartCard>
      <ChartCard
        title={t("topClubs")}
        isLoading={isLoading}
        isError={isError}
        isEmpty={empty(data?.topRunningClubs ?? [])}
        bodyClassName="h-64"
      >
        <BucketBar
          data={data?.topRunningClubs ?? []}
          horizontal
          color="var(--afu-blue)"
        />
      </ChartCard>
      <ChartCard
        title={t("topDistances")}
        isLoading={isLoading}
        isError={isError}
        isEmpty={empty(data?.topDistances ?? [])}
        bodyClassName="h-64"
      >
        <BucketBar
          data={data?.topDistances ?? []}
          horizontal
          color="var(--warn)"
        />
      </ChartCard>
      <ChartCard
        title={t("kidAges")}
        isLoading={isLoading}
        isError={isError}
        isEmpty={empty(kidAges)}
        bodyClassName="h-64"
      >
        <BucketBar data={kidAges} color="var(--afu-yellow)" />
      </ChartCard>
      <ChartCard
        title={t("promoUsage")}
        isLoading={isLoading}
        isError={isError}
        isEmpty={empty(promo)}
        bodyClassName="h-64"
      >
        <BucketPie data={promo} />
      </ChartCard>
      <ChartCard title={t("benefitGap")} bodyClassName="h-64">
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm font-medium text-ink-3">{t("notCollected")}</p>
          <p className="text-xs text-ink-4">
            {t("benefitGap")} · {t("countryGap")}
          </p>
        </div>
      </ChartCard>
    </div>
  );
}
