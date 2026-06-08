"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  className?: string;
  /** Fixed height for the chart body so skeleton/empty states match charts. */
  bodyClassName?: string;
  children: ReactNode;
}

export function ChartCard({
  title,
  isLoading,
  isError,
  isEmpty,
  className,
  bodyClassName = "h-72",
  children,
}: ChartCardProps) {
  const t = useTranslations("admin.dashboard");

  return (
    <Card className={cn("p-5", className)}>
      <h3 className="mb-4 text-sm font-semibold text-ink">{title}</h3>
      <div className={cn("w-full", bodyClassName)}>
        {isLoading ? (
          <div className="h-full w-full animate-pulse rounded-md bg-surface-2" />
        ) : isError ? (
          <div className="flex h-full items-center justify-center text-sm text-danger">
            {t("loadingError")}
          </div>
        ) : isEmpty ? (
          <div className="flex h-full items-center justify-center text-sm text-ink-3">
            {t("empty")}
          </div>
        ) : (
          children
        )}
      </div>
    </Card>
  );
}
