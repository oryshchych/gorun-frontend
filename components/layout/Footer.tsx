"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import Image from "next/image";

export default function Footer() {
  const locale = useLocale();

  const navColumns = [
    {
      heading: "Events",
      links: [
        { label: "Upcoming races", href: `/${locale}` },
        { label: "Past events", href: `/${locale}` },
      ],
    },
    {
      heading: "About",
      links: [
        { label: "Contact", href: "mailto:gorunteam.ua@gmail.com" },
        { label: "Instagram", href: "https://instagram.com/gorun.lviv" },
        { label: "Facebook", href: "https://facebook.com/profile.php?id=61584661056098" },
      ],
    },
    {
      heading: "Legal",
      links: [
        { label: "Privacy Policy", href: `/${locale}/privacy-policy` },
        { label: "Terms of Service", href: `/${locale}/terms-of-service` },
      ],
    },
  ];

  return (
    // className="dark" forces dark-mode token values always, making the footer
    // permanently dark regardless of the app-level theme toggle.
    <footer
      className="dark"
      role="contentinfo"
      style={{
        background: "var(--bg)",   // in .dark context: #14181E
        color: "var(--ink)",       // in .dark context: #EAEEF4
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
            >
              <Image
                src="/images/logos/logo.png"
                alt="GoRun"
                width={56}
                height={18}
                style={{ height: "auto", filter: "brightness(0) invert(1)" }}
              />
            </Link>
            <p style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.7, maxWidth: 300, margin: 0 }}>
              Charity running events across Ukraine. Every entry supports the
              Armed Forces.
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
                    style={{
                      fontSize: 13,
                      color: "var(--ink)",  // light text in .dark context
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
