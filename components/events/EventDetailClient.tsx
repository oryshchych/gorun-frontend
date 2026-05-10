"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Heart, Share2, Calendar, Users, Ticket, MapPin, Clock, Baby, Check } from "lucide-react";
import { Event } from "@/types/event";
import { Participant } from "@/types/registration";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Tag } from "@/components/ui/tag";
import { Button } from "@/components/ui/button";
import { ParticipantsList } from "@/components/events/ParticipantsList";
import { getLocalizedString } from "@/lib/utils";
import { format } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { uk } from "date-fns/locale/uk";

interface EventDetailClientProps {
  event: Event;
  participants: Participant[];
  locale: string;
}

type TabId = "overview" | "schedule" | "distances" | "runners";

export function EventDetailClient({
  event,
  participants,
  locale: _localeProp,
}: EventDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const locale = useLocale();
  const dateLocale = locale === "uk" ? uk : enUS;

  const title = getLocalizedString(
    event.translations?.title,
    locale,
    "en",
    event.title || ""
  );
  const description = getLocalizedString(
    event.translations?.description,
    locale,
    "en",
    event.description || ""
  );
  const location = getLocalizedString(
    event.translations?.location,
    locale,
    "en",
    event.location || ""
  );

  const coverImage =
    event.cover || event.imageUrl?.landscape || event.imageUrl?.portrait || "";

  const spotsTotal = event.spots?.total ?? event.capacity;
  const spotsTaken = event.spots?.taken ?? event.registeredCount;

  const dateLabel =
    event.dateLabel ||
    format(new Date(event.date), "EEE, MMM d yyyy", { locale: dateLocale });

  const feeLabel = event.fee || (event.basePrice ? `from ${event.basePrice} UAH` : "");

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "schedule", label: "Schedule" },
    { id: "distances", label: "Distances" },
    { id: "runners", label: "Runners" },
  ];

  return (
    <div
      style={{
        background: "var(--gr-bg)",
        color: "var(--gr-ink)",
        minHeight: "100vh",
        paddingBottom: 120,
      }}
    >
      {/* ── Hero ── */}
      <div
        style={{
          position: "relative",
          minHeight: 280,
          backgroundImage: coverImage
            ? `linear-gradient(180deg, rgba(15,26,18,0.4), rgba(15,26,18,0.85)), url(${coverImage})`
            : undefined,
          background: coverImage ? undefined : "var(--gr-ink)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#fff",
        }}
      >
        {/* Nav row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "14px 18px",
            maxWidth: 1280,
            margin: "0 auto",
          }}
        >
          <Link
            href={`/${locale}`}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              background: "rgba(255,255,255,0.95)",
              color: "#0F1A12",
              display: "grid",
              placeItems: "center",
            }}
            aria-label="Back to events"
          >
            <ArrowLeft size={18} />
          </Link>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                background: "rgba(255,255,255,0.95)",
                color: "#0F1A12",
                display: "grid",
                placeItems: "center",
              }}
              aria-label="Save event"
            >
              <Heart size={18} />
            </button>
            <button
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                background: "rgba(255,255,255,0.95)",
                color: "#0F1A12",
                display: "grid",
                placeItems: "center",
              }}
              aria-label="Share event"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Event info overlay */}
        <div
          style={{
            padding: "0 18px 20px",
            maxWidth: 1280,
            margin: "0 auto",
            marginTop: 60,
          }}
        >
          <Tag
            style={{
              background: "rgba(255,255,255,0.2)",
              color: "#fff",
              backdropFilter: "blur(6px)",
              textTransform: "none",
            }}
          >
            {dateLabel}
          </Tag>
          <h1
            className="gr-display"
            style={{
              fontSize: "clamp(26px, 5vw, 52px)",
              fontWeight: 800,
              lineHeight: 1.05,
              marginTop: 10,
              textWrap: "balance",
            }}
          >
            {title}
          </h1>
          <div
            style={{
              fontSize: 13,
              opacity: 0.85,
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <MapPin size={14} />
            {event.venue || location}
          </div>
        </div>
      </div>

      {/* ── Quick facts ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          padding: "14px 18px",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        {[
          {
            Icon: Calendar,
            top: dateLabel.split(",")[1]?.trim() ?? dateLabel,
            bot: event.timeLabel ?? "",
          },
          {
            Icon: Users,
            top: String(spotsTaken),
            bot: `of ${spotsTotal}`,
          },
          {
            Icon: Ticket,
            top: feeLabel.replace("from ", "") || "—",
            bot: "entry fee",
          },
        ].map(({ Icon, top, bot }, i) => (
          <div
            key={i}
            style={{
              background: "var(--gr-surface)",
              border: "1px solid var(--gr-line)",
              borderRadius: "var(--gr-r-md)",
              padding: 10,
            }}
          >
            <Icon size={16} color="var(--gr-brand-700)" />
            <div
              className="gr-display"
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "var(--gr-ink)",
                marginTop: 4,
              }}
            >
              {top}
            </div>
            <div style={{ fontSize: 11, color: "var(--gr-ink-3)" }}>{bot}</div>
          </div>
        ))}
      </div>

      {/* ── Tab bar ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "var(--gr-bg)",
          zIndex: 10,
          borderBottom: "1px solid var(--gr-line)",
          maxWidth: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 0,
            padding: "0 12px",
            maxWidth: 1280,
            margin: "0 auto",
          }}
        >
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "14px 12px",
                  fontSize: 14,
                  fontWeight: 700,
                  color: active ? "var(--gr-ink)" : "var(--gr-ink-3)",
                  borderBottom: `2px solid ${active ? "var(--gr-brand)" : "transparent"}`,
                  marginBottom: -1,
                  background: "transparent",
                  transition: "color 150ms",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab body ── */}
      <div
        style={{
          padding: "20px 18px",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        {/* Desktop: 2-col layout for overview */}
        <div
          style={{
            display:
              activeTab === "overview"
                ? "grid"
                : "block",
            gridTemplateColumns: "1fr 380px",
            gap: 40,
            alignItems: "flex-start",
          }}
        >
          {/* Main content column */}
          <div>
            {activeTab === "overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "var(--gr-ink-2)",
                    margin: 0,
                  }}
                >
                  {description}
                </p>

                {/* AFU card */}
                {event.afu && (
                  <div
                    style={{
                      background: "var(--gr-ink)",
                      color: "var(--gr-bg)",
                      borderRadius: "var(--gr-r-lg)",
                      padding: 18,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 999,
                          background: "var(--gr-afu-yellow)",
                        }}
                      />
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          color: "var(--gr-afu-yellow)",
                        }}
                      >
                        SUPPORTING ARMED FORCES OF UKRAINE
                      </div>
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.5 }}>{event.afu}</div>
                  </div>
                )}

                {/* Perks */}
                {event.perks && event.perks.length > 0 && (
                  <div>
                    <div
                      className="gr-display"
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        marginBottom: 10,
                      }}
                    >
                      What&apos;s included
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                        gap: 8,
                      }}
                    >
                      {event.perks.map((perk) => (
                        <div
                          key={perk}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 12px",
                            background: "var(--gr-surface)",
                            borderRadius: "var(--gr-r-md)",
                            border: "1px solid var(--gr-line)",
                            fontSize: 13,
                          }}
                        >
                          <Check size={15} color="var(--gr-brand-700)" />
                          {perk}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "schedule" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(event.program ?? event.schedule?.map((s) => [s.time, s.what] as [string, string]) ?? []).map(
                  ([time, what], i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 14,
                        padding: "14px 16px",
                        background: "var(--gr-surface)",
                        borderRadius: "var(--gr-r-md)",
                        border: "1px solid var(--gr-line)",
                        alignItems: "center",
                      }}
                    >
                      <div
                        className="gr-mono"
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "var(--gr-brand-700)",
                          minWidth: 50,
                        }}
                      >
                        {time}
                      </div>
                      <div style={{ fontSize: 14, color: "var(--gr-ink)" }}>{what}</div>
                    </div>
                  )
                )}
                {!(event.program ?? event.schedule)?.length && (
                  <p style={{ color: "var(--gr-ink-3)", fontSize: 14 }}>
                    Schedule coming soon.
                  </p>
                )}
              </div>
            )}

            {activeTab === "distances" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Adult distances */}
                {event.distances?.map((d) => (
                  <div
                    key={d.id}
                    style={{
                      background: "var(--gr-surface)",
                      borderRadius: "var(--gr-r-lg)",
                      border: "1px solid var(--gr-line)",
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <div
                          className="gr-display"
                          style={{
                            fontSize: 28,
                            fontWeight: 800,
                            color: "var(--gr-ink)",
                            lineHeight: 1,
                          }}
                        >
                          {d.label}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "var(--gr-ink-3)",
                            marginTop: 2,
                          }}
                        >
                          {d.name}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          className="gr-display"
                          style={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: "var(--gr-brand-700)",
                          }}
                        >
                          {d.feeUah ?? d.fee} ₴
                        </div>
                        {(d.elevation || d.laps) && (
                          <div style={{ fontSize: 11, color: "var(--gr-ink-3)" }}>
                            {d.elevation || d.laps}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <ProgressBar taken={d.spots.taken} total={d.spots.total} />
                    </div>
                  </div>
                ))}

                {/* Kids distances */}
                {event.kidsDistances && event.kidsDistances.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div
                      className="gr-display"
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        marginBottom: 10,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Baby size={18} /> Kids&apos; races
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        padding: 16,
                        background: "var(--gr-brand-50)",
                        borderRadius: "var(--gr-r-lg)",
                      }}
                    >
                      {event.kidsDistances.map((d) => (
                        <div
                          key={d.id}
                          style={{
                            padding: "12px 14px",
                            background: "rgba(255,255,255,0.6)",
                            borderRadius: "var(--gr-r-md)",
                            flex: "1 1 100px",
                          }}
                        >
                          <div
                            className="gr-display"
                            style={{
                              fontSize: 18,
                              fontWeight: 800,
                              color: "var(--gr-brand-700)",
                            }}
                          >
                            {d.label}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--gr-ink-3)",
                              fontWeight: 600,
                            }}
                          >
                            Age {d.age}
                          </div>
                          <div
                            style={{ fontSize: 11, color: "var(--gr-ink-3)", marginTop: 2 }}
                          >
                            {(d.feeUah ?? d.fee) === 0
                              ? "Free"
                              : `${d.feeUah ?? d.fee} ₴`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!event.distances?.length && !event.kidsDistances?.length && (
                  <p style={{ color: "var(--gr-ink-3)", fontSize: 14 }}>
                    Distance info coming soon.
                  </p>
                )}
              </div>
            )}

            {activeTab === "runners" && (
              <ParticipantsList participants={participants} isLoading={false} />
            )}
          </div>

          {/* Desktop sticky sidebar — only shown on overview on wider screens */}
          {activeTab === "overview" && (
            <div
              style={{
                position: "sticky",
                top: 90,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
              className="hidden lg:flex"
            >
              <div
                style={{
                  background: "var(--gr-surface)",
                  borderRadius: "var(--gr-r-lg)",
                  border: "1px solid var(--gr-line)",
                  padding: 24,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--gr-ink-3)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Entry from
                </div>
                <div
                  className="gr-display"
                  style={{ fontSize: 36, fontWeight: 800, marginTop: 4 }}
                >
                  {feeLabel.replace("from ", "") || "—"}
                </div>
                <div style={{ marginTop: 16 }}>
                  <ProgressBar taken={spotsTaken} total={spotsTotal} />
                </div>
                <Link
                  href={`/${locale}/events/${event.id}/register`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    width: "100%",
                    marginTop: 18,
                    padding: "16px 22px",
                    borderRadius: 999,
                    background: "var(--gr-brand)",
                    color: "#0b1a0f",
                    fontWeight: 700,
                    fontSize: 16,
                    textDecoration: "none",
                    boxShadow: "0 8px 28px var(--gr-brand-glow)",
                  }}
                >
                  Register
                </Link>
              </div>

              {event.afu && (
                <div
                  style={{
                    background: "var(--gr-ink)",
                    color: "var(--gr-bg)",
                    borderRadius: "var(--gr-r-lg)",
                    padding: 22,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: "var(--gr-afu-yellow)",
                      }}
                    />
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        color: "var(--gr-afu-yellow)",
                      }}
                    >
                      SUPPORTING ARMED FORCES
                    </div>
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.55 }}>{event.afu}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky CTA (mobile) ── */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "12px 18px 24px",
          background: "linear-gradient(180deg, transparent, var(--gr-bg) 30%)",
          zIndex: 20,
        }}
        className="lg:hidden"
      >
        <Link
          href={`/${locale}/events/${event.id}/register`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            padding: "16px 22px",
            borderRadius: 999,
            background: "var(--gr-brand)",
            color: "#0b1a0f",
            fontWeight: 700,
            fontSize: 16,
            textDecoration: "none",
            boxShadow: "0 8px 28px var(--gr-brand-glow)",
          }}
        >
          Register{feeLabel ? ` · ${feeLabel}` : ""}
        </Link>
      </div>
    </div>
  );
}
