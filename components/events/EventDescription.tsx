"use client";

import { Event } from "@/types/event";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  Users,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
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
  const localizedDate = getLocalizedString(
    event.translations?.date,
    locale,
    "en",
    event.date?.toString() || ""
  );
  const localizedSpeakers = event.translations?.speakers
    ? getLocalizedArray(
        event.translations.speakers,
        locale,
        "en",
        event.speakers || []
      )
    : event.speakers;

  // Helper function to get coordinates (prioritize separate fields, then parse from location)
  const getCoordinates = (): { lat: number; lng: number } | null => {
    // First, check if separate latitude/longitude fields exist
    if (event.latitude !== undefined && event.longitude !== undefined) {
      return { lat: event.latitude, lng: event.longitude };
    }
    // Fallback: try to parse coordinates from location string
    const coordMatch = localizedLocation.match(
      /(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/
    );
    if (coordMatch) {
      return { lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) };
    }
    return null;
  };

  // Helper function to create map link
  const getMapLink = (): string => {
    const coords = getCoordinates();
    if (coords) {
      // Universal link that works with Google Maps, Apple Maps, and others
      return `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
    }
    // For location strings, use Google Maps search
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(localizedLocation)}`;
  };

  // Helper function to get Google Maps embed URL (no API key needed)
  const getMapEmbedUrl = (): string | null => {
    const coords = getCoordinates();
    if (coords) {
      // Use coordinates directly - works without API key
      return `https://www.google.com/maps?q=${coords.lat},${coords.lng}&output=embed`;
    }
    // For location strings, use search query
    return `https://www.google.com/maps?q=${encodeURIComponent(localizedLocation)}&output=embed`;
  };

  // Helper function to get static map image URL (alternative to iframe)
  const getStaticMapUrl = (): string | null => {
    const coords = getCoordinates();
    if (coords) {
      // Static map image - no service worker issues
      return `https://maps.googleapis.com/maps/api/staticmap?center=${coords.lat},${coords.lng}&zoom=15&size=600x300&markers=${coords.lat},${coords.lng}&key=AIzaSyBFw0Qbyq9zTFTd-tUY6d-s6U4kR1F8J0`;
    }
    return null;
  };

  const coords = getCoordinates();
  const mapEmbedUrl = getMapEmbedUrl();

  // Check if we're on localhost to avoid API referrer restrictions
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "0.0.0.0");

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
              {t("when")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg" suppressHydrationWarning>
              {localizedDate}
            </p>
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {t("where")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-lg flex-1">{localizedLocation}</p>
              <a
                href={getMapLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#48C773] hover:text-[#48C773]/80 transition-colors font-medium text-sm whitespace-nowrap"
                aria-label={`${t("viewOnMap")}: ${localizedLocation}`}
              >
                <span>{t("viewOnMap")}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            {/* Embedded Map Preview */}
            {mapEmbedUrl && !isLocalhost && (
              <div className="w-full h-64 rounded-lg overflow-hidden border relative group">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={mapEmbedUrl}
                  title={`Map of ${localizedLocation}`}
                  onError={(e) => {
                    // Silently handle iframe errors to prevent console noise
                    console.debug("Map iframe load issue (non-critical)");
                  }}
                />
              </div>
            )}
            {/* On localhost, show a message instead of embed to avoid API restrictions */}
            {mapEmbedUrl && isLocalhost && (
              <div className="w-full h-64 rounded-lg border bg-muted/30 flex items-center justify-center">
                <p className="text-sm text-muted-foreground text-center px-4">
                  Map preview available on deployed site.{" "}
                  <a
                    href={getMapLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#48C773] hover:underline"
                  >
                    Open in Maps
                  </a>
                </p>
              </div>
            )}
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
