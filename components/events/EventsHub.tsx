"use client";

import { Event, PastEvent } from "@/types/event";
import { EventCard } from "@/components/events/EventCard";

interface EventsHubProps {
  events: Event[];
  pastEvents?: PastEvent[];
}

export function EventsHub({ events, pastEvents = [] }: EventsHubProps) {
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
          Summer 2026 season
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
          }}
        >
          Two races.
          <br />
          One running summer.
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
          Register, bring your kids, see your results — every entry supports the
          Armed Forces of Ukraine.
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
            Upcoming events
          </div>
          <div style={{ fontSize: 12, color: "var(--gr-ink-3)", fontWeight: 600 }}>
            {events.length} {events.length === 1 ? "race" : "races"}
          </div>
        </div>

        {/* Mobile: vertical stack / Desktop: 2-col grid */}
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
            No upcoming events yet. Check back soon.
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
              Past events
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
              <div
                key={p.id}
                style={{
                  minWidth: 200,
                  scrollSnapAlign: "start",
                  background: "var(--gr-surface)",
                  borderRadius: "var(--gr-r-lg)",
                  overflow: "hidden",
                  border: "1px solid var(--gr-line)",
                  flexShrink: 0,
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
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--gr-ink-3)",
                      fontWeight: 600,
                    }}
                  >
                    {p.dateLabel}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--gr-ink)",
                      marginTop: 2,
                    }}
                  >
                    {p.name}
                  </div>
                  {(p.distance || p.result) && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--gr-ink-3)",
                        marginTop: 4,
                      }}
                    >
                      {[p.distance, p.result].filter(Boolean).join(" · ")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
