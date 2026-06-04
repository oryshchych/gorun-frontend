"use server";

import { notFound } from "next/navigation";
import { Event } from "@/types/event";
import { getLocalizedString } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/api$/, "");

interface ResultRow {
  id: string;
  position?: number;
  positionGender?: number;
  positionAge?: number;
  finishTime?: string;
  paceMinKm?: string;
  bib?: string;
  name?: string;
  city?: string;
  distance?: string;
}

async function fetchEvent(id: string, locale: string): Promise<Event | null> {
  try {
    const res = await fetch(`${API_BASE}/api/events/${id}?lang=${locale}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as Event;
  } catch {
    return null;
  }
}

async function fetchResults(id: string): Promise<ResultRow[]> {
  try {
    const res = await fetch(`${API_BASE}/api/events/${id}/results`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []) as ResultRow[];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const event = await fetchEvent(id, locale);
  const title = event
    ? getLocalizedString(
        event.translations?.title,
        locale,
        "en",
        event.title || ""
      )
    : "Results";
  return { title: `Results — ${title}` };
}

export default async function PublicResultsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const event = await fetchEvent(id, locale);

  if (!event) notFound();

  // Results only available for finished events
  if (event.status && event.status !== "FINISHED") {
    return (
      <div
        style={{
          background: "var(--bg)",
          color: "var(--ink)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          textAlign: "center",
        }}
      >
        <div
          className="gr-display"
          style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}
        >
          Results not yet available
        </div>
        <p style={{ fontSize: 14, color: "var(--ink-3)", maxWidth: 320 }}>
          Results will be published after the race finishes.
        </p>
        <Link
          href={`/${locale}/events/${id}`}
          style={{
            marginTop: 24,
            padding: "12px 24px",
            borderRadius: 999,
            background: "var(--brand)",
            color: "var(--on-brand)",
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Back to event
        </Link>
      </div>
    );
  }

  const results = await fetchResults(id);

  const title = getLocalizedString(
    event.translations?.title,
    locale,
    "en",
    event.title || ""
  );

  const podium = results.slice(0, 3);
  const rest = results.slice(3);

  const medalColors = [
    "var(--afu-yellow)",
    "var(--medal-silver)",
    "var(--medal-bronze)",
  ];

  return (
    <div
      style={{
        background: "var(--bg)",
        color: "var(--ink)",
        minHeight: "100vh",
        paddingBottom: 100,
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 18px" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Link
            href={`/${locale}/events/${id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "var(--ink-3)",
              fontWeight: 600,
              textDecoration: "none",
              marginBottom: 12,
            }}
          >
            <ArrowLeft size={15} />
            Back to event
          </Link>
          <h1
            className="gr-display"
            style={{ fontSize: 32, fontWeight: 800, margin: 0 }}
          >
            Results
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 4 }}>
            {title}
          </p>
        </div>

        {results.length === 0 ? (
          <div
            style={{
              padding: "48px 0",
              textAlign: "center",
              color: "var(--ink-3)",
              fontSize: 14,
            }}
          >
            Results will be published soon.
          </div>
        ) : (
          <>
            {/* Podium */}
            {podium.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 16,
                  marginBottom: 28,
                }}
              >
                {podium.map((r, i) => (
                  <div
                    key={r.id}
                    style={{
                      background: "var(--surface)",
                      borderRadius: "var(--r-lg)",
                      border: "1px solid var(--line)",
                      padding: 24,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: medalColors[i],
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                      }}
                    >
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          background: medalColors[i],
                          color: "var(--ink)",
                          display: "grid",
                          placeItems: "center",
                          fontWeight: 800,
                          fontSize: 22,
                        }}
                      >
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>
                          {r.name || "—"}
                        </div>
                        {r.city && (
                          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                            {r.city}
                          </div>
                        )}
                      </div>
                    </div>
                    {r.finishTime && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: 16,
                          paddingTop: 14,
                          borderTop: "1px solid var(--line)",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 10,
                              color: "var(--ink-3)",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                            }}
                          >
                            Finish
                          </div>
                          <div
                            className="gr-mono"
                            style={{
                              fontSize: 20,
                              fontWeight: 800,
                              marginTop: 2,
                            }}
                          >
                            {r.finishTime}
                          </div>
                        </div>
                        {r.paceMinKm && (
                          <div>
                            <div
                              style={{
                                fontSize: 10,
                                color: "var(--ink-3)",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                              }}
                            >
                              Pace
                            </div>
                            <div
                              className="gr-mono"
                              style={{
                                fontSize: 14,
                                fontWeight: 700,
                                marginTop: 4,
                              }}
                            >
                              {r.paceMinKm}/km
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Full table */}
            {rest.length > 0 && (
              <div
                style={{
                  background: "var(--surface)",
                  borderRadius: "var(--r-lg)",
                  border: "1px solid var(--line)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "48px 2fr 1fr 100px 120px 120px",
                    padding: "12px 18px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--ink-3)",
                    letterSpacing: "0.06em",
                    borderBottom: "1px solid var(--line)",
                    textTransform: "uppercase",
                  }}
                >
                  <div>Pos</div>
                  <div>Name</div>
                  <div>City</div>
                  <div>Dist</div>
                  <div>Time</div>
                  <div>Pace</div>
                </div>
                {rest.map((r, i) => (
                  <div
                    key={r.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "48px 2fr 1fr 100px 120px 120px",
                      padding: "14px 18px",
                      alignItems: "center",
                      borderBottom:
                        i < rest.length - 1 ? "1px solid var(--line)" : "none",
                      fontSize: 14,
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{r.position ?? i + 4}</div>
                    <div style={{ fontWeight: 600 }}>{r.name || "—"}</div>
                    <div style={{ color: "var(--ink-3)", fontSize: 13 }}>
                      {r.city || "—"}
                    </div>
                    <div>
                      {r.distance && (
                        <span
                          style={{
                            background: "var(--surface-2)",
                            color: "var(--ink-2)",
                            borderRadius: 999,
                            padding: "3px 8px",
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {r.distance}
                        </span>
                      )}
                    </div>
                    <div className="gr-mono" style={{ fontWeight: 700 }}>
                      {r.finishTime || "—"}
                    </div>
                    <div
                      className="gr-mono"
                      style={{ color: "var(--ink-3)", fontSize: 13 }}
                    >
                      {r.paceMinKm ? `${r.paceMinKm}/km` : "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
