"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
const NAV_ITEMS = [
  { segment: "", labelKey: "navProfile" as const },
  { segment: "my-events", labelKey: "navMyEvents" as const },
  { segment: "past-events", labelKey: "navPastEvents" as const },
  { segment: "results", labelKey: "navResults" as const },
];

export function ProfileNavLinks({
  className,
  linkClassName,
}: {
  className?: string;
  linkClassName: (active: boolean) => string;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("profile");
  const base = `/${locale}/profile`;

  return (
    <nav className={className} aria-label={t("navAriaLabel")}>
      {NAV_ITEMS.map(({ segment, labelKey }) => {
        const href = segment ? `${base}/${segment}` : base;
        const active =
          segment === ""
            ? pathname === base || pathname === `${base}/`
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={segment || "root"}
            href={href}
            className={linkClassName(active)}
            aria-current={active ? "page" : undefined}
          >
            {t(labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
