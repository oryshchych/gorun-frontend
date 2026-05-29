"use client";

import { useLocale, useTranslations } from "next-intl";
import { CalendarDays, LayoutDashboard, TicketPercent } from "lucide-react";
import { AppShell } from "@/components/layout/shell";
import type { ShellNavItem } from "@/components/layout/shell";

const NAV = [
  {
    segment: "dashboard",
    labelKey: "dashboard",
    icon: LayoutDashboard,
    exactOnly: true,
  },
  { segment: "promo-codes", labelKey: "promoCodes", icon: TicketPercent },
  { segment: "events", labelKey: "events", icon: CalendarDays },
] as const;

export function useAdminShellConfig() {
  const locale = useLocale();
  const t = useTranslations("admin.nav");
  const basePath = `/${locale}/admin`;

  const navItems: ShellNavItem[] = NAV.map((item) => ({
    segment: item.segment,
    label: t(item.labelKey),
    icon: item.icon,
    ...("exactOnly" in item && item.exactOnly ? { exactOnly: true } : {}),
  }));

  return {
    basePath,
    navItems,
    navAriaLabel: t("adminNav"),
  };
}

export function AdminAppShell({ children }: { children: React.ReactNode }) {
  const config = useAdminShellConfig();

  return (
    <AppShell
      basePath={config.basePath}
      navItems={config.navItems}
      navAriaLabel={config.navAriaLabel}
    >
      {children}
    </AppShell>
  );
}
