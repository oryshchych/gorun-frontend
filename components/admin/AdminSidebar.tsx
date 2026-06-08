"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  ScrollText,
  TicketPercent,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { isSuperAdminUser } from "@/lib/admin/access";
import { AppShell } from "@/components/layout/shell";
import type { ShellNavItem } from "@/components/layout/shell";

const BASE_NAV = [
  {
    segment: "dashboard",
    labelKey: "dashboard",
    icon: LayoutDashboard,
    exactOnly: true,
  },
  { segment: "promo-codes", labelKey: "promoCodes", icon: TicketPercent },
  { segment: "events", labelKey: "events", icon: CalendarDays },
  { segment: "users", labelKey: "users", icon: Users },
  { segment: "registrations", labelKey: "registrations", icon: ClipboardList },
] as const;

const SUPER_ADMIN_NAV = [
  { segment: "audit-logs", labelKey: "auditLogs", icon: ScrollText },
] as const;

type NavItem = (typeof BASE_NAV)[number] | (typeof SUPER_ADMIN_NAV)[number];

export function useAdminShellConfig() {
  const locale = useLocale();
  const t = useTranslations("admin.nav");
  const { user } = useAuth();
  const basePath = `/${locale}/admin`;

  const nav: NavItem[] = isSuperAdminUser(user)
    ? [...BASE_NAV, ...SUPER_ADMIN_NAV]
    : [...BASE_NAV];

  const navItems: ShellNavItem[] = nav.map((item) => ({
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
