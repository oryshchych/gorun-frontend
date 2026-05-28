"use client";

import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, CalendarDays, LayoutDashboard, TicketPercent } from "lucide-react";
import { AppShell } from "@/components/layout/shell";
import type { ShellFooterLink, ShellNavItem } from "@/components/layout/shell";

const NAV = [
  { segment: "dashboard", labelKey: "dashboard", icon: LayoutDashboard, exactOnly: true },
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

  const footer: ShellFooterLink = {
    href: `/${locale}`,
    label: t("backToSite"),
    icon: ArrowLeft,
  };

  return {
    basePath,
    navItems,
    footer,
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
      footer={config.footer}
    >
      {children}
    </AppShell>
  );
}
