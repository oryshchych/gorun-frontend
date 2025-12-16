"use client";

import { Event } from "@/types/event";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { uk } from "date-fns/locale/uk";
import { useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { getLocalizedString } from "@/lib/utils";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const t = useTranslations("events");
  const locale = useLocale();
  const dateLocale = locale === "uk" ? uk : enUS;

  const availableSpots = event.capacity - event.registeredCount;
  const isFull = availableSpots <= 0;
  const isAlmostFull =
    availableSpots > 0 && availableSpots <= event.capacity * 0.2;

  const formattedDate = format(new Date(event.date), "PPP", {
    locale: dateLocale,
  });
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
  const organizerName = event.organizer?.name;

  return (
    <Link
      href={`/${locale}/events/${event.id}`}
      aria-label={`View details for ${localizedTitle}`}
      className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg block"
    >
      <motion.div
        whileHover={{
          scale: 1.03,
          y: -8,
          transition: { duration: 0.2, ease: "easeOut" },
        }}
        whileTap={{ scale: 0.98 }}
        className="h-full"
      >
        <Card
          className="h-full overflow-hidden hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
          role="article"
        >
          {/* Event Image */}
          <div
            className="relative w-full h-48 bg-muted"
            role="img"
            aria-label={
              event.imageUrl
                ? `Event image for ${localizedTitle}`
                : "No event image"
            }
          >
            {event.imageUrl ? (
              <Image
                src={event.imageUrl}
                alt={`Event image for ${localizedTitle}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-primary/5">
                <Calendar
                  className="w-16 h-16 text-muted-foreground/30"
                  aria-hidden="true"
                />
              </div>
            )}

            {/* Capacity Badge */}
            <div className="absolute top-3 right-3">
              {isFull ? (
                <Badge
                  variant="destructive"
                  className="shadow-md"
                  aria-label="Event is full"
                >
                  {t("eventFull")}
                </Badge>
              ) : isAlmostFull ? (
                <Badge
                  variant="secondary"
                  className="shadow-md"
                  aria-label={`${availableSpots} spots available`}
                >
                  {availableSpots} {t("availableSpots")}
                </Badge>
              ) : (
                <Badge
                  variant="default"
                  className="shadow-md"
                  aria-label={`${availableSpots} spots available`}
                >
                  {availableSpots} {t("availableSpots")}
                </Badge>
              )}
            </div>
          </div>

          <CardContent className="p-4">
            {/* Event Title */}
            <h3 className="font-semibold text-lg line-clamp-2 mb-3">
              {localizedTitle}
            </h3>

            {/* Event Details */}
            <div className="space-y-2 text-sm text-muted-foreground">
              {/* Date */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span
                  className="truncate"
                  aria-label={`Event date: ${formattedDate}`}
                >
                  {formattedDate}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span
                  className="truncate"
                  aria-label={`Location: ${localizedLocation}`}
                >
                  {localizedLocation}
                </span>
              </div>

              {/* Capacity */}
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span
                  aria-label={`${event.registeredCount} registered out of ${event.capacity} capacity`}
                >
                  {event.registeredCount} / {event.capacity}
                </span>
              </div>
            </div>
          </CardContent>

          {organizerName && (
            <CardFooter className="p-4 pt-0">
              {/* Organizer */}
              <div className="text-xs text-muted-foreground">
                {t("organizer")}: {organizerName}
              </div>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </Link>
  );
}
