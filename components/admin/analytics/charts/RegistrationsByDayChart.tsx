"use client";

import { useTranslations } from "next-intl";
import { format, parseISO } from "date-fns";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RegistrationDayPoint } from "@/types/analytics";
import {
  CHART_AXIS_COLOR,
  CHART_GRID_COLOR,
  tooltipStyle,
} from "@/lib/analytics/format";

const shortDay = (iso: string) => format(parseISO(iso), "dd.MM");

export function RegistrationsByDayChart({
  data,
}: {
  data: RegistrationDayPoint[];
}) {
  const t = useTranslations("admin.dashboard.charts");

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
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
        <Area
          type="monotone"
          dataKey="cumulative"
          name={t("registrations")}
          stroke="var(--brand)"
          fill="var(--brand-tint)"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="count"
          name={t("registrations")}
          stroke="var(--info)"
          strokeWidth={1.5}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
