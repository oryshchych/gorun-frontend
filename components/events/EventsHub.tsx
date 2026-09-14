"use client";

import { Event, PastEvent } from "@/types/event";
import { EventCard } from "@/components/events/EventCard";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

interface EventsHubProps {
  events: Event[];
  pastEvents?: PastEvent[];
}

/** Section headings shared by the upcoming list and the past-events rail. */
const sectionHeading = "gr-display text-lg font-bold text-ink";

export function EventsHub({ events, pastEvents = [] }: EventsHubProps) {
  const locale = useLocale();
  const t = useTranslations("hub");

  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      {/* ── Hero copy ── */}
      <div className="mx-auto max-w-7xl px-4.5 pb-1.5 pt-4.5">
        <div className="text-xs font-bold uppercase tracking-[0.08em] text-brand-active">
          {t("seasonLabel")}
        </div>
        <h1 className="gr-display mt-1 whitespace-pre-line text-[28px] font-extrabold leading-[1.05] text-ink text-balance sm:text-4xl md:text-5xl lg:text-[56px]">
          {t("heroHeadline")}
        </h1>
        <p className="mt-2 max-w-140 text-sm leading-[1.5] text-ink-3">
          {t("heroSub")}
        </p>
      </div>

      {/* ── Upcoming events ── */}
      <div className="mx-auto max-w-7xl px-4.5">
        <div className="flex items-baseline justify-between pb-3 pt-4.5">
          <div className={sectionHeading}>{t("upcoming")}</div>
          <div className="text-xs font-semibold text-ink-3">
            {t("racesCount", { count: events.length })}
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,420px),1fr))] gap-4">
          {events.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>

        {events.length === 0 && (
          <div className="py-12 text-center text-sm text-ink-3">
            {t("noUpcoming")}
          </div>
        )}
      </div>

      {/* ── Past events rail ── */}
      {pastEvents.length > 0 && (
        <div className="mx-auto max-w-7xl">
          <div className="px-4.5 pb-2.5 pt-7">
            <div className={sectionHeading}>{t("past")}</div>
          </div>
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4.5 pb-6">
            {pastEvents.map((p) => (
              <Link
                key={p.id}
                href={`/${locale}/events/${p.id}`}
                className="block min-w-50 shrink-0 snap-start overflow-hidden rounded-lg border border-line bg-surface text-inherit no-underline transition-colors hover:bg-surface-2"
              >
                {p.cover && (
                  <div
                    className="h-22.5 bg-cover bg-center"
                    style={{ backgroundImage: `url(${p.cover})` }}
                  />
                )}
                <div className="p-3">
                  <div className="text-[11px] font-semibold text-ink-3">
                    {p.dateLabel}
                  </div>
                  <div className="mt-0.5 text-sm font-bold text-ink">
                    {p.name}
                  </div>
                  {(p.distance || p.result) && (
                    <div className="mt-1 text-xs text-ink-3">
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
