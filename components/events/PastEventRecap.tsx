"use client";

import { useLocale, useTranslations } from "next-intl";
import { cn, getLocalizedString } from "@/lib/utils";
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
    <section className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-5">
      <div>
        <div
          className={cn(
            "gr-display text-lg font-extrabold text-ink",
            hasCopy && "mb-2.5"
          )}
        >
          {t("howItWas")}
        </div>
        {hasCopy && (
          <p className="m-0 text-[15px] leading-[1.65] text-ink-2">
            {pastText}
          </p>
        )}
      </div>

      {hasPhotos && (
        <div>
          <div className="gr-display mb-2.5 text-[13px] font-bold uppercase tracking-[0.06em] text-ink-3">
            {t("photos")}
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
            {photos.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="aspect-[4/3] max-w-full overflow-hidden rounded-md border border-line bg-surface-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- gallery URLs from API (mixed http/https hosts) */}
                <img
                  src={src}
                  alt={t("photoAlt", { n: i + 1 })}
                  loading="lazy"
                  className="block size-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
