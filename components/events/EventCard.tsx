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
import { getLocalizedString } from "@/lib/utils";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const dateLocale = locale === "uk" ? uk : enUS;

  // Resolve cover image
  const coverImage =
    event.cover ||
    event.imageUrl?.landscape ||
    event.imageUrl?.portrait ||
    "";

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
    getLocalizedString(event.translations?.location, locale, "en", event.location || "");

  // Spots
  const spotsTotal = event.spots?.total ?? event.capacity;
  const spotsTaken = event.spots?.taken ?? event.registeredCount;

  // Date label
  const dateLabel =
    event.dateLabel ||
    format(new Date(event.date), "EEE, MMM d yyyy", { locale: dateLocale });

  const feeLabel = event.fee || (event.basePrice ? `from ${event.basePrice} UAH` : "");

  return (
    <Link
      href={`/${locale}/events/${event.id}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-brand)] rounded-[var(--gr-r-xl)]"
      aria-label={`View details for ${title}`}
    >
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.18, ease: "easeOut" } }}
        whileTap={{ scale: 0.98 }}
      >
        <article
          style={{
            borderRadius: "var(--gr-r-xl)",
            overflow: "hidden",
            background: "var(--gr-surface)",
            border: "1px solid var(--gr-line)",
            boxShadow: "var(--gr-shadow-md)",
          }}
        >
          {/* Cover */}
          <div
            style={{
              position: "relative",
              height: 180,
              backgroundImage: coverImage
                ? `linear-gradient(180deg, rgba(15,26,18,0) 30%, rgba(15,26,18,0.85)), url(${coverImage})`
                : undefined,
              background: coverImage ? undefined : "var(--gr-surface-2)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Date chip */}
            <div className="absolute top-3.5 left-3.5">
              <span
                style={{
                  background: "rgba(255,255,255,0.95)",
                  color: "#0F1A12",
                  borderRadius: 999,
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}
              >
                {dateLabel}
              </span>
            </div>
            {/* Fee chip */}
            {feeLabel && (
              <div className="absolute top-3.5 right-3.5">
                <span
                  style={{
                    background: "rgba(255,255,255,0.95)",
                    color: "#0F1A12",
                    borderRadius: 12,
                    padding: "4px 10px",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {feeLabel}
                </span>
              </div>
            )}
            {/* Title overlay */}
            {coverImage && (
              <div
                style={{
                  position: "absolute",
                  left: 16,
                  right: 16,
                  bottom: 14,
                  color: "#fff",
                }}
              >
                <div
                  className="gr-display"
                  style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.1 }}
                >
                  {title}
                </div>
                {shortDesc && (
                  <div style={{ fontSize: 12, opacity: 0.85, marginTop: 3 }}>
                    {shortDesc}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Title (when no cover image) */}
            {!coverImage && (
              <h3
                className="gr-display"
                style={{ fontSize: 18, fontWeight: 700, color: "var(--gr-ink)", margin: 0 }}
              >
                {title}
              </h3>
            )}

            {/* Meta row */}
            <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--gr-ink-3)" }}>
              {city && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={13} /> {city}
                </span>
              )}
              {event.timeLabel && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Clock size={13} /> {event.timeLabel}
                </span>
              )}
            </div>

            {/* Distance pills */}
            {(event.distances?.length || event.kidsDistances?.length) ? (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {event.distances?.map((d) => (
                  <span
                    key={d.id}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      background: "var(--gr-surface-2)",
                      color: "var(--gr-ink-2)",
                    }}
                  >
                    {d.label}
                  </span>
                ))}
                {event.kidsDistances?.length ? (
                  <span
                    style={{
                      padding: "5px 10px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      background: "var(--gr-brand-50)",
                      color: "var(--gr-brand-700)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Baby size={13} /> Kids
                  </span>
                ) : null}
              </div>
            ) : null}

            {/* Progress */}
            <ProgressBar taken={spotsTaken} total={spotsTotal} />

            {/* Footer row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontSize: 12, color: "var(--gr-ink-3)" }}>
                {Math.round((spotsTaken / spotsTotal) * 100)}% full
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--gr-ink)",
                }}
              >
                View event →
              </div>
            </div>
          </div>
        </article>
      </motion.div>
    </Link>
  );
}
