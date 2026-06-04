"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations("footer");

  const navColumns: { heading: string; links: { label: string; href: string; external: boolean }[] }[] = [
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
        { label: t("contact"), href: "mailto:gorunteam.ua@gmail.com", external: false },
        { label: "Instagram", href: "https://instagram.com/gorun.lviv", external: true },
        { label: "Facebook", href: "https://facebook.com/profile.php?id=61584661056098", external: true },
      ],
    },
    {
      heading: t("legalHeading"),
      links: [
        { label: t("privacyPolicy"), href: `/${locale}/privacy-policy`, external: false },
        { label: t("termsOfService"), href: `/${locale}/terms-of-service`, external: false },
      ],
    },
  ];

  return (
    // className="dark" forces dark-mode token values always — footer is permanently dark
    <footer
      className="dark"
      role="contentinfo"
      style={{
        background: "var(--bg)",
        color: "var(--ink)",
        padding: "48px 32px 0",
        marginTop: 64,
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Main grid — 2-col on mobile, 4-col on md+ */}
        <div className="grid grid-cols-2 gap-8 pb-10 md:grid-cols-[2fr_1fr_1fr_1fr] md:gap-10">
          {/* Brand column — full width on mobile */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href={`/${locale}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 14 }}
              aria-label="GoRun home"
            >
              <Image
                src="/images/logos/logo.png"
                alt="GoRun"
                width={56}
                height={18}
                style={{ height: "auto" }}
              />
            </Link>
            <p style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.7, maxWidth: 300, margin: 0 }}>
              {t("tagline")}
            </p>
          </div>

          {/* Nav columns */}
          {navColumns.map((col) => (
            <div key={col.heading}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "var(--brand)",
                  marginBottom: 14,
                  textTransform: "uppercase",
                }}
              >
                {col.heading}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    {...(link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    style={{
                      fontSize: 13,
                      color: "var(--ink)",
                      opacity: 0.8,
                      textDecoration: "none",
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 0",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            fontSize: 12,
            opacity: 0.6,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span suppressHydrationWarning>
            © {new Date().getFullYear()} GoRun · Lviv, Ukraine
          </span>
          <span>gorunteam.ua@gmail.com</span>
        </div>
      </div>
    </footer>
  );
}
