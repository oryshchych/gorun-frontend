"use client";

import { Event } from "@/types/event";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, Image as ImageIcon } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import Image from "next/image";
import { getLocalizedArray, getLocalizedString } from "@/lib/utils";

interface EventDescriptionProps {
  event: Event;
}

export function EventDescription({ event }: EventDescriptionProps) {
  const t = useTranslations("event");
  const locale = useLocale();

  const localizedTitle = getLocalizedString(
    event.translations?.title,
    locale,
    "en",
    event.title || ""
  );
  const localizedDescription = getLocalizedString(
    event.translations?.description,
    locale,
    "en",
    event.description || ""
  );
  const localizedLocation = getLocalizedString(
    event.translations?.location,
    locale,
    "en",
    event.location || ""
  );
  const localizedSpeakers = event.translations?.speakers
    ? getLocalizedArray(
        event.translations.speakers,
        locale,
        "en",
        event.speakers || []
      )
    : event.speakers;

  return (
    <div className="space-y-6">
      {/* Event Image */}
      {event.imageUrl && (
        <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden border">
          <Image
            src={event.imageUrl}
            alt={localizedTitle}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
            priority
          />
        </div>
      )}

      {/* Event Title */}
      <h1 className="text-3xl md:text-4xl font-bold">{localizedTitle}</h1>

      {/* Event Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t("date")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              {format(new Date(event.date), "PPP 'at' p")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {t("location")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{localizedLocation}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t("capacity")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              {event.registeredCount} / {event.capacity} {t("registered")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>{t("description")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {localizedDescription}
          </p>
        </CardContent>
      </Card>

      {/* Speakers (if available) */}
      {localizedSpeakers && localizedSpeakers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("speakers")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              {localizedSpeakers.map((speaker, index) => (
                <li key={index} className="text-muted-foreground">
                  {speaker}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Gallery (if available) */}
      {event.gallery && event.gallery.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              {t("gallery")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {event.gallery.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden border"
                >
                  <Image
                    src={imageUrl}
                    alt={`${localizedTitle} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
