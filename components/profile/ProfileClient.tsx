"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Settings, Baby, Plus, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMyRegistrations } from "@/hooks/useRegistrations";
import { Registration } from "@/types/registration";

type ProfileTab = "current" | "past" | "kids";

export function ProfileClient() {
  const { user } = useAuth();
  const locale = useLocale();
  const t = useTranslations("profileHub");
  const [tab, setTab] = useState<ProfileTab>("current");
  const { data: registrationsData } = useMyRegistrations();

  const registrations: Registration[] = registrationsData?.data || [];
  const upcoming = registrations.filter(
    (r) => r.status !== "cancelled" && r.event && new Date(r.event.date) > new Date()
  );
  const past = registrations.filter(
    (r) => r.event && new Date(r.event.date) <= new Date()
  );

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: "current", label: t("tabs.current") },
    { id: "past", label: t("tabs.past") },
    { id: "kids", label: t("tabs.kids") },
  ];

  if (!user) {
    return <ProfilePrompt locale={locale} />;
  }

  return (
    <div
      style={{
        background: "var(--gr-bg)",
        color: "var(--gr-ink)",
        minHeight: "100vh",
        paddingBottom: 120,
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            padding: "14px 18px 8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
        <h1
          className="gr-display"
          style={{ fontSize: 22, fontWeight: 800, margin: 0 }}
        >
          {t("title")}
        </h1>
          <Link
            href={`/${locale}/profile/settings`}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              background: "var(--gr-surface)",
              border: "1px solid var(--gr-line)",
              display: "grid",
              placeItems: "center",
              color: "var(--gr-ink)",
            }}
            aria-label="Settings"
          >
            <Settings size={18} />
          </Link>
        </div>

        {/* Identity card */}
        <div style={{ padding: "0 18px" }}>
          <div
            style={{
              background: "var(--gr-surface)",
              borderRadius: "var(--gr-r-lg)",
              border: "1px solid var(--gr-line)",
              padding: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* Avatar */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 999,
                  background: "linear-gradient(135deg, var(--gr-brand), var(--gr-brand-700))",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 22,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="gr-display"
                  style={{ fontSize: 20, fontWeight: 800 }}
                >
                  {user.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--gr-ink-3)", marginTop: 2 }}>
                  {(user as any).runningClub
                    ? `${(user as any).runningClub} · `
                    : ""}
                  {(user as any).city || user.email}
                </div>
              </div>
              <Link
                href={`/${locale}/profile/settings`}
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--gr-brand-700)",
                  textDecoration: "none",
                }}
              >
                Edit
              </Link>
            </div>

            {/* Stats strip */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
                marginTop: 16,
                paddingTop: 16,
                borderTop: "1px dashed var(--gr-line-strong)",
              }}
            >
              {[
                [String((user as any).totalKm ?? "—"), t("stats.km")],
                [String(registrations.length), t("stats.races")],
                [`${(user as any).totalDonated ?? 0}₴`, t("stats.afu")],
              ].map(([n, l]) => (
                <div key={l}>
                  <div
                    className="gr-display"
                    style={{ fontSize: 20, fontWeight: 800, color: "var(--gr-ink)" }}
                  >
                    {n}
                  </div>
                  <div
                    style={{ fontSize: 11, color: "var(--gr-ink-3)", fontWeight: 600 }}
                  >
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tab pills */}
        <div
          style={{
            display: "flex",
            gap: 4,
            padding: "20px 18px 0",
          }}
        >
          {tabs.map(({ id, label }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 700,
                  background: active ? "var(--gr-ink)" : "transparent",
                  color: active ? "var(--gr-bg)" : "var(--gr-ink-3)",
                  border: active ? "0" : "1px solid var(--gr-line)",
                  cursor: "pointer",
                  minHeight: 44,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div style={{ padding: "14px 18px 0" }}>
          {tab === "current" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {upcoming.length === 0 ? (
                <div
                  style={{
                    padding: "24px 0",
                    textAlign: "center",
                    color: "var(--gr-ink-3)",
                    fontSize: 14,
                  }}
                >
                  {t("noUpcoming")}
                </div>
              ) : (
                upcoming.map((reg) => (
                  <RacePassCard key={reg.id} reg={reg} />
                ))
              )}

              {/* CTA to browse events */}
              <Link
                href={`/${locale}`}
                style={{
                  padding: 16,
                  borderRadius: "var(--gr-r-lg)",
                  textAlign: "left",
                  background: "var(--gr-surface)",
                  border: "1.5px dashed var(--gr-line-strong)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  textDecoration: "none",
                  color: "var(--gr-ink)",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--gr-r-md)",
                    background: "var(--gr-brand-50)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Plus size={22} color="var(--gr-brand-700)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>
                    {t("browseEvents")}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--gr-ink-3)" }}>
                    {t("browseEventsSub")}
                  </div>
                </div>
                <ArrowRight size={18} color="var(--gr-ink-3)" />
              </Link>
            </div>
          )}

          {tab === "past" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {past.length === 0 ? (
                <div
                  style={{
                    padding: "24px 0",
                    textAlign: "center",
                    color: "var(--gr-ink-3)",
                    fontSize: 14,
                  }}
                >
                  {t("noPast")}
                </div>
              ) : (
                past.map((reg) => (
                  <PastRaceCard key={reg.id} reg={reg} />
                ))
              )}
            </div>
          )}

          {tab === "kids" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {((user as any).kids as any[] | undefined)?.map((k: any) => (
                <div
                  key={k.id}
                  style={{
                    background: "var(--gr-surface)",
                    borderRadius: "var(--gr-r-lg)",
                    border: "1px solid var(--gr-line)",
                    padding: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 999,
                      background: "var(--gr-brand-50)",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Baby size={22} color="var(--gr-brand-700)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{k.name}</div>
                    <div style={{ fontSize: 12, color: "var(--gr-ink-3)" }}>
                      Age {k.age}
                      {k.shirt ? ` · Shirt ${k.shirt}` : ""}
                    </div>
                  </div>
                  <button
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--gr-brand-700)",
                      background: "transparent",
                      border: 0,
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                </div>
              ))}

              <button
                style={{
                  padding: 14,
                  border: "1.5px dashed var(--gr-line-strong)",
                  borderRadius: "var(--gr-r-md)",
                  color: "var(--gr-ink-3)",
                  fontWeight: 600,
                  fontSize: 13,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  background: "transparent",
                  cursor: "pointer",
                  minHeight: 44,
                }}
              >
                <Plus size={16} /> {t("addChild")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RacePassCard({ reg }: { reg: Registration }) {
  const eventTitle =
    reg.event?.title ||
    reg.event?.translations?.title?.uk ||
    reg.event?.translations?.title?.en ||
    "Event";

  return (
    <div
      style={{
        borderRadius: "var(--gr-r-xl)",
        overflow: "hidden",
        background: "var(--gr-ink)",
        color: "var(--gr-bg)",
      }}
    >
      <div
        style={{
          padding: "16px 18px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--gr-brand)",
              letterSpacing: "0.08em",
            }}
          >
                      UPCOMING
          </div>
          <div
            className="gr-display"
            style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}
          >
            {eventTitle}
          </div>
        </div>
        <div
          style={{
            width: 56,
            height: 56,
            background: "#fff",
            borderRadius: 8,
            display: "grid",
            placeItems: "center",
            fontSize: 10,
            color: "#000",
            fontWeight: 700,
          }}
        >
          QR
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          borderTop: "1px dashed rgba(255,255,255,0.2)",
        }}
      >
        {[
          ["BIB", (reg as any).bib ? String((reg as any).bib).padStart(4, "0") : "—"],
          ["DIST", (reg as any).distance || "—"],
          ["STATUS", reg.status === "confirmed" ? "CONF" : reg.status.toUpperCase()],
          ["PAY", reg.paymentStatus === "completed" ? "PAID" : reg.paymentStatus?.toUpperCase() ?? "—"],
        ].map(([k, v]) => (
          <div
            key={k}
            style={{ padding: 12, borderRight: "1px dashed rgba(255,255,255,0.2)" }}
          >
            <div
              style={{
                fontSize: 9,
                opacity: 0.6,
                fontWeight: 700,
                letterSpacing: "0.08em",
              }}
            >
              {k}
            </div>
            <div
              className="gr-mono"
              style={{ fontSize: 14, fontWeight: 800 }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PastRaceCard({ reg }: { reg: Registration }) {
  const cover =
    reg.event?.cover ||
    reg.event?.imageUrl?.landscape ||
    reg.event?.imageUrl?.portrait;
  const eventTitle =
    reg.event?.title ||
    reg.event?.translations?.title?.uk ||
    reg.event?.translations?.title?.en ||
    "Event";

  return (
    <div
      style={{
        background: "var(--gr-surface)",
        borderRadius: "var(--gr-r-lg)",
        border: "1px solid var(--gr-line)",
        overflow: "hidden",
        display: "flex",
        alignItems: "stretch",
      }}
    >
      {cover && (
        <div
          style={{
            width: 80,
            backgroundImage: `url(${cover})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            flexShrink: 0,
          }}
        />
      )}
      <div style={{ flex: 1, padding: 14 }}>
        <div style={{ fontSize: 11, color: "var(--gr-ink-3)", fontWeight: 600 }}>
          {reg.event?.date
            ? new Date(reg.event.date).toLocaleDateString("en", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : ""}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>
          {eventTitle}
        </div>
        <div
          style={{ display: "flex", gap: 12, marginTop: 8, alignItems: "center" }}
        >
          {(reg as any).distance && (
            <span
              style={{
                background: "var(--gr-surface-2)",
                color: "var(--gr-ink-2)",
                borderRadius: 999,
                padding: "4px 10px",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {(reg as any).distance}
            </span>
          )}
          <span
            style={{
              fontSize: 12,
              color: reg.status === "confirmed" ? "var(--gr-brand-700)" : "var(--gr-ink-3)",
              fontWeight: 600,
            }}
          >
            {reg.status === "confirmed" ? "Completed" : reg.status}
          </span>
        </div>
      </div>
    </div>
  );
}

function ProfilePrompt({ locale }: { locale: string }) {
  return (
    <div
      className="gr-screen-enter"
      style={{
        background: "var(--gr-bg)",
        color: "var(--gr-ink)",
        minHeight: "100vh",
        padding: "24px 22px 130px",
      }}
    >
      <div style={{ marginTop: 30 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 999,
            background: "var(--gr-brand-50)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--gr-brand-700)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h1
          className="gr-display"
          style={{
            fontSize: 28,
            fontWeight: 800,
            marginTop: 18,
            textWrap: "balance",
            lineHeight: 1.1,
          }}
        >
          Your runner profile, in one place.
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--gr-ink-3)",
            marginTop: 10,
            lineHeight: 1.55,
          }}
        >
          Sign in to see your race pass, register your kids, track results, and
          pick up where you left off.
        </p>
      </div>

      <div
        style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 10 }}
      >
        {[
          "Race pass with QR for check-in",
          "Save your kids and re-register in one tap",
          "All your past results and splits",
          "Track total donated to AFU",
        ].map((text) => (
          <div
            key={text}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              background: "var(--gr-surface)",
              border: "1px solid var(--gr-line)",
              borderRadius: "var(--gr-r-md)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                background: "var(--gr-brand-50)",
                color: "var(--gr-brand-700)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              ✓
            </div>
            <div style={{ fontSize: 13, color: "var(--gr-ink-2)" }}>{text}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 22 }}>
        <Link
          href={`/${locale}/login`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: 56,
            borderRadius: 999,
            background: "var(--gr-brand)",
            color: "#0b1a0f",
            fontWeight: 700,
            fontSize: 16,
            textDecoration: "none",
          }}
        >
          Sign in or create account
        </Link>
        <p
          style={{
            textAlign: "center",
            marginTop: 10,
            fontSize: 12,
            color: "var(--gr-ink-4)",
          }}
        >
          You can browse events, runners, and results without an account.
        </p>
      </div>
    </div>
  );
}
