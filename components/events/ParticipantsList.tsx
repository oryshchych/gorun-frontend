"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Participant } from "@/types/registration";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

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

/** Pill chrome shared by the distance filter buttons. */
const filterPill =
  "cursor-pointer whitespace-nowrap rounded-(--r-pill) border-0 px-4 py-2 text-[13px] font-semibold transition-colors";

/** Small uppercase tag chrome, used for the "you" badge and distance tags. */
const tagClasses =
  "rounded-(--r-pill) font-semibold uppercase tracking-[0.04em]";

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
    return <div className="py-6 text-sm text-ink-3">{t("loading")}</div>;
  }

  return (
    <div>
      {/* Search */}
      <div className="relative mb-3">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search")}
          className="w-full rounded-(--r-pill) border-[1.5px] border-line-strong bg-surface py-3 pl-10.5 pr-4 text-base text-ink focus:border-brand focus:shadow-[0_0_0_4px_var(--brand-glow)] focus:outline-none"
          aria-label={t("searchAriaLabel")}
        />
      </div>

      {/* Distance filter — pill segment */}
      {distanceOptions.length > 0 && (
        <div className="mb-3 flex gap-1 overflow-x-auto rounded-(--r-pill) bg-surface-2 p-1">
          {["all", ...distanceOptions].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDistFilter(d)}
              className={cn(
                filterPill,
                distFilter === d
                  ? "bg-ink text-bg"
                  : "bg-transparent text-ink-2 hover:text-ink"
              )}
            >
              {d === "all" ? t("allDistances") : d}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-ink-3">
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
                  className={cn(
                    "flex items-center gap-3 px-4 py-3",
                    i < filtered.length - 1 && "border-b border-line",
                    isMe ? "bg-brand-tint" : "bg-transparent"
                  )}
                >
                  {/* Bib */}
                  <div className="gr-mono min-w-10 text-[11px] font-bold text-ink-3">
                    {bib ? `#${String(bib).padStart(3, "0")}` : "—"}
                  </div>

                  {/* Name + city */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-ink">
                      {fullName}
                      {isMe && (
                        <span
                          className={cn(
                            tagClasses,
                            "bg-brand-tint px-1.5 py-0.5 text-[9px] text-brand-active"
                          )}
                        >
                          {t("you")}
                        </span>
                      )}
                    </div>
                    {p.city && (
                      <div className="text-xs text-ink-3">{p.city}</div>
                    )}
                  </div>

                  {/* Distance tag */}
                  {dist && (
                    <span
                      className={cn(
                        tagClasses,
                        "bg-surface-2 px-2.5 py-1 text-[11px] text-ink-2"
                      )}
                    >
                      {dist}
                    </span>
                  )}
                </div>
              );
            })
        )}
      </div>

      <div className="mt-2 text-center text-xs text-ink-4">
        {t("count", { filtered: filtered.length, total: participants.length })}
      </div>
    </div>
  );
}
