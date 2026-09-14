"use client";

import { Event } from "@/types/event";
import { ProgressBar } from "@/components/ui/progress-bar";
import { MapPin, Clock, Baby } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { uk } from "date-fns/locale/uk";
import { useLocale } from "next-intl";
import Link from "next/link";
import { cn, getLocalizedString } from "@/lib/utils";

interface EventCardProps {
  event: Event;
}

/** Chips sit on the cover photo's dark scrim — same chrome, different content. */
const coverChipClasses =
  "bg-surface/95 px-2.5 py-1 text-[11px] font-bold text-ink";

/** Distance / kids pills in the card body. */
const pillClasses = "rounded-[var(--r-pill)] px-2.5 py-1.25 text-xs font-bold";

export function EventCard({ event }: EventCardProps) {
  const t = useTranslations("hub");
  const locale = useLocale();
  const dateLocale = locale === "uk" ? uk : enUS;

  // Resolve cover image
  const coverImage =
    event.cover || event.imageUrl?.landscape || event.imageUrl?.portrait || "";

  // Resolve display title
  const title = getLocalizedString(
    event.translations?.title,
    locale,
    "en",
    event.title || event.name || ""
  );

  // Resolve short description
  const shortDesc =
    event.shortDesc ||
    event.short ||
    getLocalizedString(event.translations?.description, locale, "en", "") ||
    "";

  // Resolve city
  const city =
    event.city ||
    getLocalizedString(
      event.translations?.location,
      locale,
      "en",
      event.location || ""
    );

  // Spots
  const spotsTotal = event.spots?.total ?? event.capacity;
  const spotsTaken = event.spots?.taken ?? event.registeredCount;
  const percentFull =
    spotsTotal > 0 ? Math.round((spotsTaken / spotsTotal) * 100) : 0;

  // Date label
  const dateLabel =
    event.dateLabel ||
    format(new Date(event.date), "EEE, MMM d yyyy", { locale: dateLocale });

  // Resolve fee label — comes from API field `event.fee`, fall back to basePrice
  const feeLabel = event.fee || "";

  return (
    <Link
      href={`/${locale}/events/${event.id}`}
      className="block rounded-xl focus-visible:shadow-[0_0_0_4px_var(--brand-glow)] focus-visible:outline-none"
      aria-label={t("viewDetailsFor", { title })}
    >
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.18, ease: "easeOut" } }}
        whileTap={{ scale: 0.98 }}
      >
        <article className="overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-md)]">
          {/* Cover */}
          <div
            className={cn(
              "relative h-60 bg-cover bg-center",
              !coverImage && "bg-surface-2"
            )}
            style={
              coverImage
                ? {
                    backgroundImage: `linear-gradient(180deg, rgba(15,26,18,0) 30%, rgba(15,26,18,0.85)), url(${coverImage})`,
                  }
                : undefined
            }
          >
            {/* Date chip */}
            <div className="absolute left-3.5 top-3.5">
              <span
                className={cn(
                  coverChipClasses,
                  "rounded-[var(--r-pill)] tracking-[0.04em]"
                )}
              >
                {dateLabel}
              </span>
            </div>
            {/* Fee chip */}
            {feeLabel && (
              <div className="absolute right-3.5 top-3.5">
                <span className={cn(coverChipClasses, "rounded-md")}>
                  {feeLabel}
                </span>
              </div>
            )}
            {/* Title overlay — sits on the scrim, so it stays white in both themes */}
            {coverImage && (
              <div className="absolute inset-x-4 bottom-3.5 text-white">
                <div className="gr-display text-[22px] font-extrabold leading-[1.1]">
                  {title}
                </div>
                {shortDesc && (
                  <div className="mt-0.75 text-xs opacity-85">{shortDesc}</div>
                )}
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex flex-col gap-2.5 p-3.5">
            {/* Title (when no cover image — otherwise the overlay carries it) */}
            {!coverImage && (
              <h3 className="gr-display m-0 text-lg font-bold text-ink">
                {title}
              </h3>
            )}

            {/* Meta row */}
            <div className="flex gap-3 text-xs text-ink-3">
              {city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={13} /> {city}
                </span>
              )}
              {event.timeLabel && (
                <span className="inline-flex items-center gap-1">
                  <Clock size={13} /> {event.timeLabel}
                </span>
              )}
            </div>

            {/* Distance pills */}
            {event.distances?.length || event.kidsDistances?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {event.distances?.map((d) => (
                  <span
                    key={d.id}
                    className={cn(pillClasses, "bg-surface-2 text-ink-2")}
                  >
                    {d.label}
                  </span>
                ))}
                {event.kidsDistances?.length ? (
                  <span
                    className={cn(
                      pillClasses,
                      "inline-flex items-center gap-1 bg-brand-tint text-brand-active"
                    )}
                  >
                    <Baby size={13} /> {t("kidsLabel")}
                  </span>
                ) : null}
              </div>
            ) : null}

            {/* Progress */}
            <ProgressBar taken={spotsTaken} total={spotsTotal} />

            {/* Footer row */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-ink-3">
                {t("percentFull", { percent: percentFull })}
              </div>
              <div className="inline-flex items-center gap-1 text-[13px] font-bold text-ink">
                {t("viewEvent")}
              </div>
            </div>
          </div>
        </article>
      </motion.div>
    </Link>
  );
}
