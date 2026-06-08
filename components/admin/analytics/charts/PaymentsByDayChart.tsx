"use client";

import { useTranslations } from "next-intl";
import { format, parseISO } from "date-fns";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PaymentDayPoint } from "@/types/analytics";
import {
  CHART_AXIS_COLOR,
  CHART_GRID_COLOR,
  tooltipStyle,
} from "@/lib/analytics/format";

const shortDay = (iso: string) => format(parseISO(iso), "dd.MM");

export function PaymentsByDayChart({ data }: { data: PaymentDayPoint[] }) {
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
          yAxisId="count"
          allowDecimals={false}
          tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }}
          stroke={CHART_GRID_COLOR}
        />
        <YAxis
          yAxisId="sum"
          orientation="right"
          tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }}
          stroke={CHART_GRID_COLOR}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(l) => shortDay(String(l))}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar
          yAxisId="count"
          dataKey="count"
          name={t("paymentsCount")}
          fill="var(--brand)"
          radius={[3, 3, 0, 0]}
          maxBarSize={28}
        />
        <Line
          yAxisId="sum"
          type="monotone"
          dataKey="sum"
          name={t("revenue")}
          stroke="var(--info)"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
