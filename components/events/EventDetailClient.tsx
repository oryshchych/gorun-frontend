"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Share2,
  Calendar,
  Users,
  Ticket,
  MapPin,
  Baby,
  Check,
  Trophy,
} from "lucide-react";
import { Event } from "@/types/event";
import { resolveDistancePrice } from "@/lib/distance-price";
import { Participant } from "@/types/registration";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Tag } from "@/components/ui/tag";
import { ParticipantsList } from "@/components/events/ParticipantsList";
import { PastEventRecap } from "@/components/events/PastEventRecap";
import { getLocalizedString } from "@/lib/utils";
import {
  isPastEventExperience,
  isRegistrationClosed,
} from "@/lib/event-registration";
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
  const t = useTranslations("eventDetail");
  const dateLocale = locale === "uk" ? uk : enUS;

  const title =
    event.resolvedTitle ||
    getLocalizedString(
      event.translations?.title,
      locale,
      "en",
      event.title || ""
    );
  const description =
    event.resolvedDescription ||
    getLocalizedString(
      event.translations?.description,
      locale,
      "en",
      event.description || ""
    );
  const location =
    event.resolvedLocation ||
    getLocalizedString(
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

  // Fee comes from the API `event.fee` field — no client-side formatting
  const feeLabel = event.fee || "";

  const registrationClosed = isRegistrationClosed(event);
  const pastExperience = isPastEventExperience(event);
  const showMobileSticky = !registrationClosed || pastExperience;

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: t("tabs.overview") },
    { id: "schedule", label: t("tabs.schedule") },
    { id: "distances", label: t("tabs.distances") },
    { id: "runners", label: t("tabs.runners") },
  ];

  return (
    <div
      style={{
        background: "var(--bg)",
        color: "var(--ink)",
        minHeight: "100vh",
        paddingBottom: showMobileSticky ? 120 : 40,
      }}
    >
      {/* ── Hero (image only) ── */}
      <div
        style={{
          position: "relative",
          minHeight: 460,
          backgroundImage: coverImage ? `url(${coverImage})` : undefined,
          backgroundColor: "var(--surface-2)",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* ── Nav row (overlay) ── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
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
              background: "var(--surface)",
              border: "1px solid var(--line)",
              color: "var(--ink)",
              display: "grid",
              placeItems: "center",
            }}
            aria-label={t("backToEvents")}
          >
            <ArrowLeft size={18} />
          </Link>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                background: "var(--surface)",
                color: "var(--ink)",
                display: "grid",
                placeItems: "center",
                border: "1px solid var(--line)",
                cursor: "pointer",
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
                background: "var(--surface)",
                color: "var(--ink)",
                display: "grid",
                placeItems: "center",
                border: "1px solid var(--line)",
                cursor: "pointer",
              }}
              aria-label="Share event"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Event info ── */}
      <div
        style={{
          padding: "0 18px 20px",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
          }}
        >
          <Tag style={{ textTransform: "none" }}>{dateLabel}</Tag>
          {pastExperience && (
            <Tag tone="dark" style={{ textTransform: "none" }}>
              {t("past.badge")}
            </Tag>
          )}
        </div>
        <h1
          className="gr-display"
          style={{
            fontSize: "clamp(28px, 5vw, 64px)",
            fontWeight: 800,
            lineHeight: 1.05,
            marginTop: 10,
            textWrap: "balance",
            color: "var(--ink)",
          }}
        >
          {title}
        </h1>
        <div
          style={{
            fontSize: 13,
            color: "var(--ink-3)",
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
        {pastExperience
          ? [
              <div
                key="d"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--r-md)",
                  padding: 10,
                }}
              >
                <Calendar size={16} color="var(--brand-active)" />
                <div
                  className="gr-display"
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "var(--ink)",
                    marginTop: 4,
                  }}
                >
                  {dateLabel.split(",")[1]?.trim() ?? dateLabel}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
                  {event.timeLabel ?? ""}
                </div>
              </div>,
              <div
                key="r"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--r-md)",
                  padding: 10,
                }}
              >
                <Users size={16} color="var(--brand-active)" />
                <div
                  className="gr-display"
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "var(--ink)",
                    marginTop: 4,
                  }}
                >
                  {String(spotsTaken)}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
                  {t("past.runnersOnRecord")}
                </div>
              </div>,
              <Link
                key="res"
                href={`/${locale}/events/${event.id}/results`}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--r-md)",
                  padding: 10,
                  textDecoration: "none",
                  color: "inherit",
                  display: "block",
                  transition: "border-color 150ms, background 150ms",
                }}
              >
                <Trophy size={16} color="var(--brand-active)" />
                <div
                  className="gr-display"
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "var(--ink)",
                    marginTop: 4,
                  }}
                >
                  {t("past.viewResults")}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--brand-active)",
                    fontWeight: 600,
                  }}
                >
                  →
                </div>
              </Link>,
            ]
          : [
              {
                Icon: Calendar,
                top: dateLabel.split(",")[1]?.trim() ?? dateLabel,
                bot: event.timeLabel ?? "",
              },
              {
                Icon: Users,
                top: String(spotsTaken),
                bot: `/ ${spotsTotal}`,
              },
              {
                Icon: Ticket,
                top: feeLabel || "—",
                bot: t("entryFrom"),
              },
            ].map(({ Icon, top, bot }, i) => (
              <div
                key={i}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--r-md)",
                  padding: 10,
                }}
              >
                <Icon size={16} color="var(--brand-active)" />
                <div
                  className="gr-display"
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "var(--ink)",
                    marginTop: 4,
                  }}
                >
                  {top}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{bot}</div>
              </div>
            ))}
      </div>

      {/* ── Tab bar ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "var(--bg)",
          zIndex: 10,
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div
          style={{
            display: "flex",
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
                  color: active ? "var(--ink)" : "var(--ink-3)",
                  borderBottom: `2px solid ${active ? "var(--brand)" : "transparent"}`,
                  marginBottom: -1,
                  background: "transparent",
                  transition: "color 150ms",
                  border: "none",
                  borderBottomStyle: "solid",
                  borderBottomWidth: 2,
                  borderBottomColor: active ? "var(--brand)" : "transparent",
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab body ── */}
      <div style={{ padding: "20px 18px", maxWidth: 1280, margin: "0 auto" }}>
        <div
          style={{
            display: activeTab === "overview" ? "grid" : "block",
            gridTemplateColumns: "1fr 380px",
            gap: 40,
            alignItems: "flex-start",
          }}
        >
          {/* Main content column */}
          <div>
            {activeTab === "overview" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "var(--ink-2)",
                    margin: 0,
                  }}
                >
                  {description}
                </p>

                {pastExperience && <PastEventRecap event={event} />}

                {/* AFU card — body comes from API `event.afu` field */}
                {event.afu && (
                  <div
                    style={{
                      background: "var(--ink)",
                      color: "var(--bg)",
                      borderRadius: "var(--r-lg)",
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
                          background: "var(--afu-yellow)",
                        }}
                      />
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          color: "var(--afu-yellow)",
                        }}
                      >
                        {t("afuSupport")}
                      </div>
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                      {event.afu}
                    </div>
                  </div>
                )}

                {/* Perks — come from API `event.perks[]` */}
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
                      {t("included")}
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(180px, 1fr))",
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
                            background: "var(--surface)",
                            borderRadius: "var(--r-md)",
                            border: "1px solid var(--line)",
                            fontSize: 13,
                          }}
                        >
                          <Check size={15} color="var(--brand-active)" />
                          {perk}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {event.regulationUrl && (
                  <div>
                    <a
                      href={event.regulationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 14,
                        color: "var(--brand-active)",
                        textDecoration: "underline",
                        textUnderlineOffset: 3,
                      }}
                    >
                      {t("regulation")}
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === "schedule" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {/* `event.scheduleText` is free-form, multi-line text */}
                {event.scheduleText ? (
                  <p
                    style={{
                      fontSize: 15,
                      lineHeight: 1.6,
                      color: "var(--ink-2)",
                      whiteSpace: "pre-wrap",
                      margin: 0,
                    }}
                  >
                    {event.scheduleText}
                  </p>
                ) : (
                  <p style={{ color: "var(--ink-3)", fontSize: 14 }}>
                    {t("scheduleEmpty")}
                  </p>
                )}
              </div>
            )}

            {activeTab === "distances" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {/* Adult distances from API `event.distances[]` */}
                {event.distances?.map((d) => (
                  <div
                    key={d.id}
                    style={{
                      background: "var(--surface)",
                      borderRadius: "var(--r-lg)",
                      border: "1px solid var(--line)",
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
                            color: "var(--ink)",
                            lineHeight: 1,
                          }}
                        >
                          {d.label}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "var(--ink-3)",
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
                            color: "var(--brand-active)",
                          }}
                        >
                          {resolveDistancePrice(d)} ₴
                        </div>
                        {(d.elevation || d.laps) && (
                          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
                            {d.elevation || d.laps}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <ProgressBar
                        taken={d.spots?.taken ?? 0}
                        total={d.spots?.total ?? d.participantLimit ?? 0}
                      />
                    </div>
                  </div>
                ))}

                {/* Kids distances from API `event.kidsDistances[]` */}
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
                      <Baby size={18} /> {t("kidsRaces")}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        padding: 16,
                        background: "var(--brand-tint)",
                        borderRadius: "var(--r-lg)",
                      }}
                    >
                      {event.kidsDistances.map((d) => (
                        <div
                          key={d.id}
                          style={{
                            padding: "12px 14px",
                            background: "rgba(255,255,255,0.6)",
                            borderRadius: "var(--r-md)",
                            flex: "1 1 100px",
                          }}
                        >
                          <div
                            className="gr-display"
                            style={{
                              fontSize: 18,
                              fontWeight: 800,
                              color: "var(--brand-active)",
                            }}
                          >
                            {d.label}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--ink-3)",
                              fontWeight: 600,
                            }}
                          >
                            {t("age", { range: d.age })}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--ink-3)",
                              marginTop: 2,
                            }}
                          >
                            {resolveDistancePrice(d) === 0
                              ? t("free")
                              : `${resolveDistancePrice(d)} ₴`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!event.distances?.length && !event.kidsDistances?.length && (
                  <p style={{ color: "var(--ink-3)", fontSize: 14 }}>
                    {t("distancesEmpty")}
                  </p>
                )}
              </div>
            )}

            {activeTab === "runners" && (
              <ParticipantsList participants={participants} isLoading={false} />
            )}
          </div>

          {/* Desktop sticky sidebar */}
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
              {registrationClosed ? (
                pastExperience ? (
                  <div
                    style={{
                      background: "var(--surface)",
                      borderRadius: "var(--r-lg)",
                      border: "1px solid var(--line)",
                      padding: 24,
                    }}
                  >
                    <div
                      className="gr-display"
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: "var(--ink)",
                        lineHeight: 1.2,
                      }}
                    >
                      {t("past.sidebarTitle")}
                    </div>
                    <p
                      style={{
                        fontSize: 14,
                        color: "var(--ink-2)",
                        marginTop: 10,
                        lineHeight: 1.5,
                      }}
                    >
                      {t("past.sidebarSub")}
                    </p>
                    <div style={{ marginTop: 16 }}>
                      <ProgressBar taken={spotsTaken} total={spotsTotal} />
                    </div>
                    <Link
                      href={`/${locale}/events/${event.id}/results`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        width: "100%",
                        marginTop: 18,
                        padding: "16px 22px",
                        borderRadius: 999,
                        background: "var(--brand)",
                        color: "var(--on-brand)",
                        fontWeight: 700,
                        fontSize: 16,
                        textDecoration: "none",
                        boxShadow: "0 8px 28px var(--brand-glow)",
                      }}
                    >
                      {t("past.viewResults")}
                    </Link>
                    <Link
                      href={`/${locale}/events/${event.id}/runners`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        marginTop: 10,
                        padding: "14px 20px",
                        borderRadius: 999,
                        border: "1px solid var(--line-strong)",
                        color: "var(--ink)",
                        fontWeight: 600,
                        fontSize: 15,
                        textDecoration: "none",
                        background: "var(--bg)",
                      }}
                    >
                      {t("past.viewRunners")}
                    </Link>
                  </div>
                ) : (
                  <div
                    style={{
                      background: "var(--surface)",
                      borderRadius: "var(--r-lg)",
                      border: "1px solid var(--line)",
                      padding: 24,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 15,
                        color: "var(--ink-2)",
                        lineHeight: 1.55,
                        margin: 0,
                      }}
                    >
                      {event.status === "CANCELLED"
                        ? t("past.cancelled")
                        : t("past.registrationClosed")}
                    </p>
                    <Link
                      href={`/${locale}`}
                      style={{
                        display: "inline-flex",
                        marginTop: 16,
                        fontWeight: 700,
                        fontSize: 14,
                        color: "var(--brand-active)",
                        textDecoration: "none",
                      }}
                    >
                      {t("backToEvents")}
                    </Link>
                  </div>
                )
              ) : (
                <div
                  style={{
                    background: "var(--surface)",
                    borderRadius: "var(--r-lg)",
                    border: "1px solid var(--line)",
                    padding: 24,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--ink-3)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {t("entryFrom")}
                  </div>
                  <div
                    className="gr-display"
                    style={{ fontSize: 36, fontWeight: 800, marginTop: 4 }}
                  >
                    {feeLabel || "—"}
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
                      background: "var(--brand)",
                      color: "var(--on-brand)",
                      fontWeight: 700,
                      fontSize: 16,
                      textDecoration: "none",
                      boxShadow: "0 8px 28px var(--brand-glow)",
                    }}
                  >
                    {t("register")}
                  </Link>
                </div>
              )}

              {event.afu && (
                <div
                  style={{
                    background: "var(--ink)",
                    color: "var(--bg)",
                    borderRadius: "var(--r-lg)",
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
                        background: "var(--afu-yellow)",
                      }}
                    />
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        color: "var(--afu-yellow)",
                      }}
                    >
                      {t("afuSupport")}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.55 }}>
                    {event.afu}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky CTA (mobile) ── */}
      {!registrationClosed && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "12px 18px 24px",
            background: "linear-gradient(180deg, transparent, var(--bg) 30%)",
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
              background: "var(--brand)",
              color: "var(--on-brand)",
              fontWeight: 700,
              fontSize: 16,
              textDecoration: "none",
              boxShadow: "0 8px 28px var(--brand-glow)",
            }}
          >
            {feeLabel ? `${t("register")} · ${feeLabel}` : t("register")}
          </Link>
        </div>
      )}
      {registrationClosed && pastExperience && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "12px 18px 24px",
            background: "linear-gradient(180deg, transparent, var(--bg) 30%)",
            zIndex: 20,
          }}
          className="lg:hidden"
        >
          <Link
            href={`/${locale}/events/${event.id}/results`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              padding: "16px 22px",
              borderRadius: 999,
              background: "var(--brand)",
              color: "var(--on-brand)",
              fontWeight: 700,
              fontSize: 16,
              textDecoration: "none",
              boxShadow: "0 8px 28px var(--brand-glow)",
            }}
          >
            {t("past.viewResults")}
          </Link>
        </div>
      )}
    </div>
  );
}
