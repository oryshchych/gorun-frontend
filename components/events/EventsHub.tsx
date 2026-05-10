"use client";

import { Event, PastEvent } from "@/types/event";
import { EventCard } from "@/components/events/EventCard";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

interface EventsHubProps {
  events: Event[];
  pastEvents?: PastEvent[];
}

export function EventsHub({ events, pastEvents = [] }: EventsHubProps) {
  const locale = useLocale();
  const t = useTranslations("hub");

  return (
    <div
      style={{
        background: "var(--gr-bg)",
        minHeight: "100vh",
        color: "var(--gr-ink)",
        fontFamily: "var(--font-body, Inter, system-ui, sans-serif)",
      }}
    >
      {/* ── Hero copy ── */}
      <div
        style={{
          padding: "18px 18px 6px",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--gr-brand-700)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {t("seasonLabel")}
        </div>
        <h1
          className="gr-display"
          style={{
            fontSize: "clamp(28px, 6vw, 56px)",
            fontWeight: 800,
            lineHeight: 1.05,
            color: "var(--gr-ink)",
            marginTop: 4,
            textWrap: "balance",
            whiteSpace: "pre-line",
          }}
        >
          {t("heroHeadline")}
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--gr-ink-3)",
            marginTop: 8,
            lineHeight: 1.5,
            maxWidth: 560,
          }}
        >
          {t("heroSub")}
        </p>
      </div>

      {/* ── Upcoming events ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 18px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            padding: "18px 0 12px",
          }}
        >
          <div
            className="gr-display"
            style={{ fontSize: 18, fontWeight: 700, color: "var(--gr-ink)" }}
          >
            {t("upcoming")}
          </div>
          <div style={{ fontSize: 12, color: "var(--gr-ink-3)", fontWeight: 600 }}>
            {t("racesCount", { count: events.length })}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 420px), 1fr))",
            gap: 16,
          }}
        >
          {events.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>

        {events.length === 0 && (
          <div
            style={{
              padding: "48px 0",
              textAlign: "center",
              color: "var(--gr-ink-3)",
              fontSize: 14,
            }}
          >
            {t("noUpcoming")}
          </div>
        )}
      </div>

      {/* ── Past events rail ── */}
      {pastEvents.length > 0 && (
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ padding: "28px 18px 10px" }}>
            <div
              className="gr-display"
              style={{ fontSize: 18, fontWeight: 700, color: "var(--gr-ink)" }}
            >
              {t("past")}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              padding: "0 18px 24px",
              scrollSnapType: "x mandatory",
            }}
          >
            {pastEvents.map((p) => (
              <Link
                key={p.id}
                href={`/${locale}/events/${p.id}`}
                style={{
                  minWidth: 200,
                  scrollSnapAlign: "start",
                  background: "var(--gr-surface)",
                  borderRadius: "var(--gr-r-lg)",
                  overflow: "hidden",
                  border: "1px solid var(--gr-line)",
                  flexShrink: 0,
                  textDecoration: "none",
                  color: "inherit",
                  display: "block",
                }}
              >
                {p.cover && (
                  <div
                    style={{
                      height: 90,
                      backgroundImage: `url(${p.cover})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                )}
                <div style={{ padding: 12 }}>
                  <div style={{ fontSize: 11, color: "var(--gr-ink-3)", fontWeight: 600 }}>
                    {p.dateLabel}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gr-ink)", marginTop: 2 }}>
                    {p.name}
                  </div>
                  {(p.distance || p.result) && (
                    <div style={{ fontSize: 12, color: "var(--gr-ink-3)", marginTop: 4 }}>
                      {[p.distance, p.result].filter(Boolean).join(" · ")}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
