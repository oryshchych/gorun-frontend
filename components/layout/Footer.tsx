"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations("footer");

  const navColumns: {
    heading: string;
    links: { label: string; href: string; external: boolean }[];
  }[] = [
    {
      heading: t("eventsHeading"),
      links: [
        { label: t("upcomingRaces"), href: `/${locale}`, external: false },
        { label: t("pastEvents"), href: `/${locale}`, external: false },
      ],
    },
    {
      heading: t("aboutHeading"),
      links: [
        {
          label: t("contact"),
          href: "mailto:gorunteam.ua@gmail.com",
          external: false,
        },
        {
          label: "Instagram",
          href: "https://instagram.com/gorun.lviv",
          external: true,
        },
        {
          label: "Facebook",
          href: "https://facebook.com/profile.php?id=61584661056098",
          external: true,
        },
      ],
    },
    {
      heading: t("legalHeading"),
      links: [
        {
          label: t("privacyPolicy"),
          href: `/${locale}/privacy-policy`,
          external: false,
        },
        {
          label: t("termsOfService"),
          href: `/${locale}/terms-of-service`,
          external: false,
        },
      ],
    },
  ];

  return (
    // className="dark" forces dark-mode token values always — footer is permanently dark
    <footer className="dark mt-16 bg-bg px-8 pt-12 text-ink" role="contentinfo">
      <div className="mx-auto max-w-7xl">
        {/* Main grid — 2-col on mobile, 4-col on md+ */}
        <div className="grid grid-cols-2 gap-8 pb-10 md:grid-cols-[2fr_1fr_1fr_1fr] md:gap-10">
          {/* Brand column — full width on mobile */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href={`/${locale}`}
              className="mb-3.5 inline-flex items-center gap-2.5"
              aria-label={t("homeAriaLabel")}
            >
              <Image
                src="/images/logos/logo.png"
                alt="GoRun"
                width={56}
                height={18}
                className="h-auto"
              />
            </Link>
            <p className="m-0 max-w-75 text-[13px] leading-[1.6] opacity-70">
              {t("tagline")}
            </p>
          </div>

          {/* Nav columns */}
          {navColumns.map((col) => (
            <div key={col.heading}>
              <div className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.08em] text-brand">
                {col.heading}
              </div>
              <div className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    {...(link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="text-[13px] text-ink no-underline opacity-80 transition-opacity hover:opacity-100"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-5 text-xs opacity-60">
          <span suppressHydrationWarning>
            © {new Date().getFullYear()} GoRun · Lviv, Ukraine
          </span>
          <span>gorunteam.ua@gmail.com</span>
        </div>
      </div>
    </footer>
  );
}
