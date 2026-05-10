"use client";

import { useLocale, useTranslations } from "next-intl";
import { getLocalizedString } from "@/lib/utils";
import type { Event } from "@/types/event";

interface PastEventRecapProps {
  event: Event;
}

export function PastEventRecap({ event }: PastEventRecapProps) {
  const locale = useLocale();
  const t = useTranslations("eventDetail.past");

  const pastText =
    event.resolvedPastDescription ||
    getLocalizedString(
      event.translations?.pastDescription,
      locale,
      "en",
      event.pastDescription || ""
    );

  const photos = event.gallery?.filter(Boolean) ?? [];
  const hasCopy = pastText.trim().length > 0;
  const hasPhotos = photos.length > 0;

  if (!hasCopy && !hasPhotos) return null;

  return (
    <section
      style={{
        background: "var(--gr-surface)",
        border: "1px solid var(--gr-line)",
        borderRadius: "var(--gr-r-lg)",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div>
        <div
          className="gr-display"
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "var(--gr-ink)",
            marginBottom: hasCopy ? 10 : 0,
          }}
        >
          {t("howItWas")}
        </div>
        {hasCopy && (
          <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--gr-ink-2)", margin: 0 }}>
            {pastText}
          </p>
        )}
      </div>

      {hasPhotos && (
        <div>
          <div
            className="gr-display"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--gr-ink-3)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 10,
            }}
          >
            {t("photos")}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 8,
            }}
          >
            {photos.map((src, i) => (
              <div
                key={`${src}-${i}`}
                style={{
                  aspectRatio: "4/3",
                  borderRadius: "var(--gr-r-md)",
                  overflow: "hidden",
                  border: "1px solid var(--gr-line)",
                  background: "var(--gr-surface-2)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- gallery URLs from API (mixed http/https hosts) */}
                <img
                  src={src}
                  alt={t("photoAlt", { n: i + 1 })}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
