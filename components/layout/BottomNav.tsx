"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Home, Users, Trophy, User } from "lucide-react";

// Routes that exist in the app
const NAV_ITEMS = [
  { id: "events", icon: Home, href: (l: string) => `/${l}` },
  { id: "runners", icon: Users, href: (l: string) => `/${l}/events` },
  { id: "results", icon: Trophy, href: (l: string) => `/${l}/events` },
  { id: "profile", icon: User, href: (l: string) => `/${l}/profile` },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("bottomNav");

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
      aria-label={t("events")}
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 16,
        background: "var(--gr-surface)",
        borderRadius: 999,
        boxShadow: "var(--gr-shadow-lg)",
        border: "1px solid var(--gr-line)",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        padding: 6,
        zIndex: 40,
        maxWidth: 460,
        margin: "0 auto",
      }}
      className="md:hidden"
    >
      {NAV_ITEMS.map(({ id, icon: Icon, href }) => {
        const active = isActive(id);
        const label = t(id as "events" | "runners" | "results" | "profile");
        return (
          <Link
            key={id}
            href={href(locale)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              padding: "8px 0",
              borderRadius: 999,
              background: active ? "var(--gr-ink)" : "transparent",
              color: active ? "var(--gr-bg)" : "var(--gr-ink-3)",
              transition: "all 200ms",
              textDecoration: "none",
              minHeight: 44,
              justifyContent: "center",
            }}
            aria-current={active ? "page" : undefined}
            aria-label={label}
          >
            <Icon size={20} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.04em" }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
