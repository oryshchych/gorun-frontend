"use client";

import { Event } from "@/types/event";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { uk } from "date-fns/locale/uk";
import { getLocalizedString } from "@/lib/utils";
import { Calendar, MapPin } from "lucide-react";

interface EventImageOverlayProps {
  event: Event;
  className?: string;
  variant?: "full" | "compact";
}

export function EventImageOverlay({
  event,
  className = "",
  variant = "full",
}: EventImageOverlayProps) {
  const t = useTranslations("events");
  const tEvent = useTranslations("event");
  const locale = useLocale();
  const dateLocale = locale === "uk" ? uk : enUS;

  const localizedTitle = getLocalizedString(
    event.translations?.title,
    locale,
    "en",
    event.title || ""
  );
  const localizedLocation = getLocalizedString(
    event.translations?.location,
    locale,
    "en",
    event.location || ""
  );
  const localizedDescription = getLocalizedString(
    event.translations?.description,
    locale,
    "en",
    event.description || ""
  );

  const formattedDate = format(new Date(event.date), "PPP", {
    locale: dateLocale,
  });
  const formattedTime = format(new Date(event.date), "HH:mm", {
    locale: dateLocale,
  });
  const dayOfWeek = format(new Date(event.date), "EEEE", {
    locale: dateLocale,
  }).toUpperCase();
  const dayAndMonth = format(new Date(event.date), "d MMMM", {
    locale: dateLocale,
  }).toUpperCase();

  // Extract only the part after the dash (Part 2)
  const extractLocationPart2 = (location: string): string => {
    const parts = location.split(" - ");
    return parts.length > 1 ? parts[1].trim() : location;
  };
  const displayLocation = extractLocationPart2(localizedLocation);

  // Extract city from location for GORUN.[CITY] display
  const extractCity = (location: string): string => {
    const cityMatch = location.match(/([A-ZА-ЯІЇЄҐ][a-zа-яіїєґ]+)/);
    return cityMatch ? cityMatch[1].toUpperCase() : "TEAM";
  };
  const cityName = extractCity(localizedLocation);

  // Get localized speakers
  const localizedSpeakers = event.speakers
    ? event.speakers.map((speaker) => {
        const localizedName = getLocalizedString(
          speaker.translations?.fullname,
          locale,
          "en",
          speaker.fullname
        );
        return localizedName;
      })
    : [];

  if (variant === "compact") {
    return (
      <div
        className={`absolute inset-0 flex flex-col justify-end p-3 md:p-4 text-white ${className}`}
      >
        {/* Compact: Just title and key info */}
        <div className="space-y-1 md:space-y-2">
          <h2 className="text-md md:text-lg font-bold text-[#48C773] line-clamp-2">
            {localizedTitle}
          </h2>
          <div className="flex items-center gap-2 text-xs md:text-sm text-white/90">
            <Calendar className="w-3 h-3 shrink-0" />
            <span>{formattedDate}</span>
            <MapPin className="w-3 h-3 shrink-0 ml-2" />
            <span className="truncate">{displayLocation}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`absolute inset-0 flex flex-col justify-between p-4 md:p-6 lg:p-8 text-white ${className}`}
    >
      {/* Top Section - Header with logos and funds text */}
      <div className="flex flex-col items-center gap-2 md:gap-4 justify-center">
        <h2 className="text-lg md:text-3xl lg:text-3xl font-bold text-[#48C773]">
          GoRun
        </h2>
        <div className="h-px w-full bg-white/30" />
        <div className="text-xs md:text-sm font-medium text-white text-center">
          {t("allFundsForZSU")}
        </div>
      </div>

      {/* Main Content - Flexible middle section */}
      <div className="flex-1 flex flex-col justify-around space-y-4 md:space-y-6 lg:space-y-8">
        {/* Speakers - Horizontal list without heading */}
        {localizedSpeakers.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 lg:gap-6">
            {localizedSpeakers.map((speaker, index) => (
              <span
                key={index}
                className="text-base md:text-lf lg:text-lg text-white"
              >
                {speaker}
              </span>
            ))}
          </div>
        )}

        {/* Main Event Title - Very Large */}
        <div className="space-y-2 md:space-y-3">
          <h1 className="text-xl md:text-3xl lg:text-4xl xl:text-4xl font-bold text-white leading-tight text-center">
            {localizedTitle.toUpperCase()}
          </h1>
          {localizedDescription && (
            <p className="text-base md:text-lg lg:text-xl text-[#48C773] text-center">
              {t("warmIntimateMeeting")}
            </p>
          )}
        </div>

        {/* Program Section */}
        <div className="space-y-2 md:space-y-3">
          <ul className="space-y-1 md:space-y-2 text-sm md:text-base lg:text-lg text-white list-disc list-inside">
            <li>{t("professionalRunners")}</li>
            <li>{t("prizeDraw")}</li>
            <li>{t("charityAuction")}</li>
            <li>{t("coffeeBreak")}</li>
          </ul>
        </div>
      </div>

      {/* Footer Section - Three columns */}
      <div className="border-t border-white/30! pt-3 md:pt-4">
        {/* Mobile: Two lines layout */}
        <div className="flex flex-col md:hidden gap-3 text-xs text-white">
          {/* First line: Left and Right */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span>{t("shootingRange")}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="truncate">{displayLocation}</span>
            </div>
          </div>
          {/* Second line: Center */}
          <div className="text-center">
            <span className="font-medium">
              {dayOfWeek} {dayAndMonth}
            </span>
          </div>
        </div>
        {/* Desktop: Three columns grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-4 text-sm lg:text-base text-white">
          {/* Left: Venue */}
          <div className="flex flex-col">
            <span>{t("shootingRange")}</span>
          </div>
          {/* Center: Date */}
          <div className="text-center">
            <span className="font-medium">
              {dayOfWeek} {dayAndMonth}
            </span>
          </div>
          {/* Right: Location */}
          <div className="flex flex-col items-end">
            <span className="truncate">{displayLocation}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
