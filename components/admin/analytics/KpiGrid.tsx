"use client";

import { useTranslations } from "next-intl";
import {
  Banknote,
  Coins,
  HeartHandshake,
  PercentCircle,
  Receipt,
  RotateCcw,
  Sparkles,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import type { SummaryResponse } from "@/types/analytics";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/analytics/format";
import { KpiCard } from "./KpiCard";

interface KpiGridProps {
  data?: SummaryResponse;
  isLoading: boolean;
}

export function KpiGrid({ data, isLoading }: KpiGridProps) {
  const t = useTranslations("admin.dashboard.kpi");

  const cards = [
    {
      label: t("totalRegistrations"),
      value: formatNumber(data?.totalRegistrations ?? 0),
      hint: `${formatNumber(data?.paidRegistrations ?? 0)} ${t("paidRegistrations")}`,
      icon: Users,
    },
    {
      label: t("moneyGathered"),
      value: formatCurrency(data?.moneyGathered ?? 0),
      icon: Coins,
    },
    {
      label: t("conversion"),
      value: formatPercent(data?.conversionRate ?? 0),
      hint: t("conversionHint"),
      icon: PercentCircle,
    },
    {
      label: t("averageCheck"),
      value: formatCurrency(data?.averageCheck ?? 0),
      icon: Receipt,
    },
    {
      label: t("afuDonations"),
      value: formatCurrency(data?.afuDonationsTotal ?? 0),
      icon: HeartHandshake,
    },
    {
      label: t("netRevenue"),
      value: formatCurrency(data?.netRevenue ?? 0),
      hint: `${t("refunds")}: ${formatCurrency(data?.refundsTotal ?? 0)}`,
      icon: Banknote,
    },
    {
      label: t("cancelled"),
      value: formatNumber(data?.cancelledRegistrations ?? 0),
      icon: XCircle,
    },
    {
      label: t("kids"),
      value: formatNumber(data?.kidsRegistrations ?? 0),
      icon: Sparkles,
    },
    {
      label: t("newParticipants"),
      value: formatNumber(data?.newParticipants ?? 0),
      hint: `${t("returningParticipants")}: ${formatNumber(data?.returningParticipants ?? 0)}`,
      icon: UserPlus,
    },
    {
      label: t("refunds"),
      value: formatNumber(data?.refundsCount ?? 0),
      icon: RotateCcw,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((c) => (
        <KpiCard
          key={c.label}
          label={c.label}
          value={c.value}
          hint={c.hint}
          icon={c.icon}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
