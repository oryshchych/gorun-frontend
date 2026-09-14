"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Home, Users, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Routes that exist in the app
const NAV_ITEMS = [
  { id: "events", icon: Home, href: (l: string) => `/${l}` },
  { id: "runners", icon: Users, href: (l: string) => `/${l}/events` },
  { id: "results", icon: Trophy, href: (l: string) => `/${l}/events` },
  { id: "profile", icon: User, href: (l: string) => `/${l}/profile` },
] as const;

function isShellRoute(pathname: string, locale: string): boolean {
  return (
    pathname.startsWith(`/${locale}/admin`) ||
    pathname.startsWith(`/${locale}/profile`)
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("bottomNav");

  if (isShellRoute(pathname, locale)) {
    return null;
  }

  const isActive = (id: string): boolean => {
    switch (id) {
      case "events":
        return (
          pathname === `/${locale}` ||
          pathname === `/${locale}/` ||
          (pathname.startsWith(`/${locale}/events`) &&
            !pathname.includes("/runners") &&
            !pathname.includes("/results") &&
            !pathname.includes("/register"))
        );
      case "runners":
        return pathname.includes("/runners");
      case "results":
        return pathname.includes("/results");
      case "profile":
        return pathname.startsWith(`/${locale}/profile`);
      default:
        return false;
    }
  };

  return (
    <nav
      aria-label={t("label")}
      className="fixed bottom-4 left-3 right-3 z-40 mx-auto grid max-w-115 grid-cols-4 rounded-(--r-pill) border border-line bg-surface p-1.5 shadow-(--shadow-lg) md:hidden"
    >
      {NAV_ITEMS.map(({ id, icon: Icon, href }) => {
        const active = isActive(id);
        const label = t(id as "events" | "runners" | "results" | "profile");
        return (
          <Link
            key={id}
            href={href(locale)}
            className={cn(
              "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-(--r-pill) py-2 no-underline transition-all duration-200",
              active ? "bg-ink text-bg" : "text-ink-3 hover:text-ink"
            )}
            aria-current={active ? "page" : undefined}
            aria-label={label}
          >
            <Icon size={20} />
            <span className="text-[10px] font-bold tracking-[0.04em]">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
