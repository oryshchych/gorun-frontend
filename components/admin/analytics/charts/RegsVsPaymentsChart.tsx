"use client";

import { useTranslations } from "next-intl";
import { format, parseISO } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CombinedDayPoint } from "@/types/analytics";
import {
  CHART_AXIS_COLOR,
  CHART_GRID_COLOR,
  tooltipStyle,
} from "@/lib/analytics/format";

const shortDay = (iso: string) => format(parseISO(iso), "dd.MM");

export function RegsVsPaymentsChart({ data }: { data: CombinedDayPoint[] }) {
  const t = useTranslations("admin.dashboard.charts");

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={CHART_GRID_COLOR}
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tickFormatter={shortDay}
          tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }}
          stroke={CHART_GRID_COLOR}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }}
          stroke={CHART_GRID_COLOR}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(l) => shortDay(String(l))}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area
          type="monotone"
          dataKey="registrations"
          name={t("registrations")}
          stroke="var(--brand)"
          fill="var(--brand-tint)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="payments"
          name={t("payments")}
          stroke="var(--info)"
          fill="var(--info-bg)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
