"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { ArrowLeft, CalendarDays, LayoutDashboard, TicketPercent } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { segment: "dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { segment: "promo-codes", labelKey: "promoCodes", icon: TicketPercent },
  { segment: "events", labelKey: "events", icon: CalendarDays },
] as const;

export function AdminSidebar() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("admin.nav");

  const base = `/${locale}/admin`;

  const isActive = (segment: string) => {
    const href = `${base}/${segment}`;
    if (segment === "dashboard") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r bg-muted/30 min-h-screen">
      <div className="border-b p-4">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          aria-label={t("backToSite")}
        >
          <Image
            src="/images/logos/logo.png"
            alt="GoRun"
            width={48}
            height={16}
            className="h-auto w-auto max-h-8"
            style={{ height: "auto" }}
          />
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label={t("adminNav")}>
        {NAV.map(({ segment, labelKey, icon: Icon }) => (
          <Link
            key={segment}
            href={`${base}/${segment}`}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive(segment)
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {t(labelKey)}
          </Link>
        ))}
      </nav>
      <div className="border-t p-3">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          {t("backToSite")}
        </Link>
      </div>
    </aside>
  );
}
