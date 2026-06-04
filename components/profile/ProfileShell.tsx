"use client";

import { useLocale, useTranslations } from "next-intl";
import { CalendarClock, CalendarX2, Trophy, User } from "lucide-react";
import { AppShell } from "@/components/layout/shell";
import type { ShellNavItem } from "@/components/layout/shell";

const NAV = [
  { segment: "", labelKey: "navProfile", icon: User, exactOnly: true },
  { segment: "my-events", labelKey: "navMyEvents", icon: CalendarClock },
  { segment: "past-events", labelKey: "navPastEvents", icon: CalendarX2 },
  { segment: "results", labelKey: "navResults", icon: Trophy },
] as const;

export function ProfileAppShell({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const t = useTranslations("profile");
  const basePath = `/${locale}/profile`;

  const navItems: ShellNavItem[] = NAV.map((item) => ({
    segment: item.segment,
    label: t(item.labelKey),
    icon: item.icon,
    ...("exactOnly" in item && item.exactOnly ? { exactOnly: true } : {}),
  }));

  return (
    <AppShell
      basePath={basePath}
      navItems={navItems}
      navAriaLabel={t("navAriaLabel")}
    >
      {children}
    </AppShell>
  );
}
