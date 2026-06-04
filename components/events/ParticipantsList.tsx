"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Participant } from "@/types/registration";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";

/**
 * Optional fields the backend may include on a participant but that are not
 * part of the core {@link Participant} contract.
 */
interface ParticipantExtras {
  distance?: string;
  email?: string;
  bib?: number | string;
}

type ParticipantWithExtras = Participant & ParticipantExtras;

interface ParticipantsListProps {
  participants: Participant[];
  isLoading?: boolean;
  /** Available distances to filter by */
  distances?: string[];
}

export function ParticipantsList({
  participants,
  isLoading = false,
  distances,
}: ParticipantsListProps) {
  const [query, setQuery] = useState("");
  const [distFilter, setDistFilter] = useState("all");
  const { user } = useAuth();

  const t = useTranslations("runners");

  // Derive distances from data if not provided
  const distanceOptions = useMemo(() => {
    if (distances) return distances;
    const seen = new Set<string>();
    participants.forEach((p) => {
      const { distance } = p as ParticipantWithExtras;
      if (distance) seen.add(distance);
    });
    return Array.from(seen);
  }, [participants, distances]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return participants.filter((p) => {
      const dist = (p as ParticipantWithExtras).distance;
      const matchDist = distFilter === "all" || dist === distFilter;
      const fullName = `${p.name} ${p.surname}`.toLowerCase();
      const matchQ =
        !q || fullName.includes(q) || (p.city || "").toLowerCase().includes(q);
      return matchDist && matchQ;
    });
  }, [participants, query, distFilter]);

  if (isLoading) {
    return (
      <div style={{ padding: "24px 0", color: "var(--ink-3)", fontSize: 14 }}>
        Loading runners…
      </div>
    );
  }

  return (
    <div>
      {/* Search */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <Search
          size={18}
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--ink-3)",
          }}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search")}
          style={{
            width: "100%",
            padding: "12px 16px 12px 42px",
            borderRadius: "var(--r-md)",
            background: "var(--surface)",
            border: "1.5px solid var(--line-strong)",
            fontSize: 16,
            color: "var(--ink)",
            fontFamily: "inherit",
          }}
          aria-label="Search runners"
        />
      </div>

      {/* Distance filter pills */}
      {distanceOptions.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            marginBottom: 12,
            paddingBottom: 4,
          }}
        >
          {["all", ...distanceOptions].map((d) => (
            <button
              key={d}
              onClick={() => setDistFilter(d)}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
                background: distFilter === d ? "var(--ink)" : "var(--surface)",
                color: distFilter === d ? "var(--bg)" : "var(--ink-2)",
                border: "1px solid var(--line)",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {d === "all" ? t("allDistances") : d}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--r-lg)",
          border: "1px solid var(--line)",
          overflow: "hidden",
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              color: "var(--ink-3)",
              fontSize: 13,
            }}
          >
            {t("noMatch")}
          </div>
        ) : (
          filtered
            .sort(
              (a, b) =>
                new Date(a.registeredAt).getTime() -
                new Date(b.registeredAt).getTime()
            )
            .map((p, i) => {
              const extras = p as ParticipantWithExtras;
              const fullName = `${p.name} ${p.surname}`;
              const isMe =
                user &&
                (user.name?.toLowerCase() === fullName.toLowerCase() ||
                  user.email === extras.email);
              const dist = extras.distance;
              const bib = extras.bib;

              return (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    borderBottom:
                      i < filtered.length - 1
                        ? "1px solid var(--line)"
                        : "none",
                    background: isMe ? "var(--brand-tint)" : "transparent",
                  }}
                >
                  {/* Bib */}
                  <div
                    className="gr-mono"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      minWidth: 40,
                      color: "var(--ink-3)",
                    }}
                  >
                    {bib ? `#${String(bib).padStart(3, "0")}` : "—"}
                  </div>

                  {/* Name + city */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--ink)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {fullName}
                      {isMe && (
                        <span
                          style={{
                            background: "var(--brand-tint)",
                            color: "var(--brand-active)",
                            borderRadius: 999,
                            padding: "2px 6px",
                            fontSize: 9,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {t("you")}
                        </span>
                      )}
                    </div>
                    {p.city && (
                      <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                        {p.city}
                      </div>
                    )}
                  </div>

                  {/* Distance tag */}
                  {dist && (
                    <span
                      style={{
                        background: "var(--surface-2)",
                        color: "var(--ink-2)",
                        borderRadius: 999,
                        padding: "4px 10px",
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {dist}
                    </span>
                  )}
                </div>
              );
            })
        )}
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 12,
          color: "var(--ink-4)",
          textAlign: "center",
        }}
      >
        {t("count", { filtered: filtered.length, total: participants.length })}
      </div>
    </div>
  );
}
