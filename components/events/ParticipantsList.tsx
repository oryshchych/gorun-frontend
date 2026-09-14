"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Participant } from "@/types/registration";
import { Distance } from "@/types/event";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface ParticipantsListProps {
  participants: Participant[];
  isLoading?: boolean;
  /** Event distances, used to group and order participants. */
  distances?: Distance[];
}

interface ParticipantGroup {
  key: string;
  label: string;
  items: Participant[];
}

const tagClasses =
  "rounded-(--r-pill) font-semibold uppercase tracking-[0.04em]";

const GENDER_LABEL_KEY: Record<string, string> = {
  female: "genderFemale",
  male: "genderMale",
  other: "genderOther",
  prefer_not_to_say: "genderPreferNot",
};

function distanceLengthMeters(d: Distance): number {
  if (typeof d.distanceMeters === "number") return d.distanceMeters;
  if (typeof d.km === "number") return d.km * 1000;
  return 0;
}

/** Adult distances longest→shortest, then kids' distances. */
function orderDistances(distances: Distance[]): Distance[] {
  const adult = distances
    .filter((d) => !d.isKids)
    .sort((a, b) => distanceLengthMeters(b) - distanceLengthMeters(a));
  const kids = distances.filter((d) => d.isKids);
  return [...adult, ...kids];
}

export function ParticipantsList({
  participants,
  isLoading = false,
  distances,
}: ParticipantsListProps) {
  const [query, setQuery] = useState("");
  const { user } = useAuth();
  const t = useTranslations("runners");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter((p) => {
      const fullName = `${p.name} ${p.surname}`.toLowerCase();
      return fullName.includes(q) || (p.city || "").toLowerCase().includes(q);
    });
  }, [participants, query]);

  const groups = useMemo<ParticipantGroup[]>(() => {
    const ordered = orderDistances(distances ?? []);
    const byDistance = new Map<string, Participant[]>();
    const other: Participant[] = [];

    for (const p of filtered) {
      const match = ordered.find(
        (d) =>
          (p.distanceId && d.id === p.distanceId) ||
          (p.distance && d.label === p.distance)
      );
      if (match?.id) {
        const arr = byDistance.get(match.id) ?? [];
        arr.push(p);
        byDistance.set(match.id, arr);
      } else {
        other.push(p);
      }
    }

    const result: ParticipantGroup[] = [];
    for (const d of ordered) {
      const items = d.id ? (byDistance.get(d.id) ?? []) : [];
      if (items.length > 0) {
        result.push({
          key: d.id ?? d.label ?? "",
          label: d.label || d.name || "",
          items,
        });
      }
    }
    if (other.length > 0) {
      result.push({ key: "__other", label: t("otherDistance"), items: other });
    }
    // No distance metadata at all → one ungrouped bucket.
    if (result.length === 0 && filtered.length > 0) {
      result.push({ key: "__all", label: "", items: filtered });
    }
    return result;
  }, [filtered, distances, t]);

  if (isLoading) {
    return <div className="py-6 text-sm text-ink-3">{t("loading")}</div>;
  }

  const genderLabel = (gender?: string): string | null => {
    if (!gender) return null;
    const key = GENDER_LABEL_KEY[gender];
    return key ? t(key) : null;
  };

  const meta = (p: Participant): string =>
    [
      p.city,
      p.age != null ? t("ageYears", { age: p.age }) : null,
      genderLabel(p.gender),
    ]
      .filter(Boolean)
      .join(" · ");

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

      {groups.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface p-8 text-center text-[13px] text-ink-3">
          {t("noMatch")}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <div key={group.key}>
              {group.label && (
                <div className="mb-2 flex items-center gap-2 px-1">
                  <h3 className="gr-display text-sm font-extrabold text-ink">
                    {group.label}
                  </h3>
                  <span
                    className={cn(
                      tagClasses,
                      "bg-surface-2 px-2 py-0.5 text-[11px] text-ink-3"
                    )}
                  >
                    {group.items.length}
                  </span>
                </div>
              )}
              <div className="overflow-hidden rounded-lg border border-line bg-surface">
                {group.items
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(a.registeredAt).getTime() -
                      new Date(b.registeredAt).getTime()
                  )
                  .map((p, i, arr) => {
                    const fullName = `${p.name} ${p.surname}`;
                    const isMe =
                      !!user &&
                      user.name?.toLowerCase() === fullName.toLowerCase();
                    const metaLine = meta(p);
                    return (
                      <div
                        key={p.id}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3",
                          i < arr.length - 1 && "border-b border-line",
                          isMe ? "bg-brand-tint" : "bg-transparent"
                        )}
                      >
                        <div className="gr-mono min-w-10 text-[11px] font-bold text-ink-3">
                          {p.bib ? `#${String(p.bib).padStart(3, "0")}` : "—"}
                        </div>
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
                          {metaLine && (
                            <div className="text-xs text-ink-3">{metaLine}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 text-center text-xs text-ink-4">
        {t("count", { filtered: filtered.length, total: participants.length })}
      </div>
    </div>
  );
}
