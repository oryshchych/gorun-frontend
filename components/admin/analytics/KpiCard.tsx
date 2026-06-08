"use client";

import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  isLoading?: boolean;
}

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  isLoading,
}: KpiCardProps) {
  return (
    <Card className="flex items-center gap-4 p-5">
      {Icon ? (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-tint text-brand">
          <Icon className="size-5" />
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-ink-3">{label}</p>
        {isLoading ? (
          <div className="mt-1 h-6 w-24 animate-pulse rounded bg-surface-2" />
        ) : (
          <p className="text-xl font-semibold text-ink">{value}</p>
        )}
        {hint ? <p className="text-xs text-ink-4">{hint}</p> : null}
      </div>
    </Card>
  );
}
