"use client";

import { Event } from "@/types/event";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  Users,
  Image as ImageIcon,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import Image from "next/image";
import {
  getLocalizedArray,
  getLocalizedString,
  getLocalizedSpeaker,
} from "@/lib/utils";
import { useResponsiveImage } from "@/hooks/useResponsiveImage";
import { EventImageOverlay } from "./EventImageOverlay";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Instagram } from "lucide-react";

interface EventDescriptionProps {
  event: Event;
}

export function EventDescription({ event }: EventDescriptionProps) {
  const t = useTranslations("event");
  const locale = useLocale();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

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
  const mainImage = useResponsiveImage(event.imageUrl);
  // Get localized speakers
  const localizedSpeakers = event.speakers
    ? event.speakers.map((speaker) => getLocalizedSpeaker(speaker, locale))
    : [];

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
  // Use useState to avoid hydration mismatch
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    setIsLocalhost(
      window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "0.0.0.0"
    );
  }, []);

  // Handle keyboard navigation in gallery
  useEffect(() => {
    if (selectedImageIndex === null || !event.gallery) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedImageIndex((prev) =>
          prev !== null ? Math.max(0, prev - 1) : null
        );
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedImageIndex((prev) =>
          prev !== null ? Math.min(event.gallery!.length - 1, prev + 1) : null
        );
      } else if (e.key === "Escape") {
        e.preventDefault();
        setSelectedImageIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, event.gallery]);

  const handleNextImage = () => {
    if (selectedImageIndex !== null && event.gallery) {
      setSelectedImageIndex((prev) =>
        prev !== null ? (prev + 1) % event.gallery!.length : null
      );
    }
  };

  const handlePrevImage = () => {
    if (selectedImageIndex !== null && event.gallery) {
      setSelectedImageIndex((prev) =>
        prev !== null
          ? (prev - 1 + event.gallery!.length) % event.gallery!.length
          : null
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Image */}
      {mainImage && (
        <div className="relative w-full h-144 lg:h-[700px] rounded-lg overflow-hidden border">
          <Image
            src={mainImage.trim()}
            alt={localizedTitle}
            fill
            className="object-cover object-bottom"
            sizes="(max-width: 768px) 100vw, 1200px"
            priority
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
          <EventImageOverlay event={event} variant="full" />
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
              {t("location")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <p className="text-lg flex-1">{localizedLocation}</p>
              <a
                href={getMapLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-medium text-sm whitespace-nowrap"
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
      {localizedDescription && (
        <Card>
          <CardHeader>
            <CardTitle>{t("description")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-[#48C773] prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-ul:text-muted-foreground prose-li:text-muted-foreground">
              <ReactMarkdown
                components={
                  {
                    p: ({ children }) => (
                      <p className="mb-4 last:mb-0">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-foreground">
                        {children}
                      </strong>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-4 space-y-2">
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li className="text-muted-foreground">{children}</li>
                    ),
                  } as Components
                }
              >
                {String(localizedDescription)}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Speakers (if available) */}
      {localizedSpeakers && localizedSpeakers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("speakers")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" className="w-full">
              {localizedSpeakers.map((speaker, index) => (
                <AccordionItem
                  key={speaker.id || index}
                  value={`speaker-${index}`}
                >
                  <AccordionTrigger>
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-semibold text-foreground">
                        {speaker.fullname}
                      </span>
                      <span className="text-sm text-muted-foreground font-normal">
                        {speaker.shortDescription}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col md:flex-row gap-6 pt-4 md:pt-8 items-start">
                      {/* Image */}
                      {speaker.image && (
                        <div className="relative w-full md:w-64 aspect-square rounded-lg overflow-hidden border shrink-0">
                          <Image
                            src={speaker.image.trim()}
                            alt={speaker.fullname}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 256px"
                          />
                        </div>
                      )}
                      {/* Description */}
                      <div className="space-y-4 flex-1">
                        <div className="prose prose-sm prose-neutral max-w-none dark:prose-invert prose-p:text-muted-foreground">
                          <ReactMarkdown
                            components={
                              {
                                p: ({ children }) => (
                                  <p className="mb-3 last:mb-0">{children}</p>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-semibold text-foreground">
                                    {children}
                                  </strong>
                                ),
                              } as Components
                            }
                          >
                            {String(speaker.description)}
                          </ReactMarkdown>
                        </div>
                        {speaker.instagramLink && (
                          <a
                            href={speaker.instagramLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors font-medium text-sm"
                          >
                            <Instagram className="w-4 h-4" />
                            <span>Instagram</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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
                  className="relative aspect-square rounded-lg overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity group"
                  onClick={() => setSelectedImageIndex(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedImageIndex(index);
                    }
                  }}
                  aria-label={`View image ${index + 1} of ${event.gallery?.length || 0}`}
                >
                  <Image
                    src={imageUrl.trim()}
                    alt={`${localizedTitle} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gallery Carousel Dialog */}
      <Dialog
        open={selectedImageIndex !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedImageIndex(null);
        }}
      >
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 gap-0 bg-black/95 border-none [&>button]:hidden">
          <DialogTitle className="sr-only">
            {selectedImageIndex !== null && event.gallery
              ? `${localizedTitle} - Image ${selectedImageIndex + 1} of ${event.gallery.length}`
              : "Gallery"}
          </DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 cursor-pointer"
              onClick={() => setSelectedImageIndex(null)}
              aria-label="Close gallery"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Previous Button */}
            {event.gallery && event.gallery.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 z-50 text-white hover:bg-white/20 h-12 w-12 cursor-pointer"
                onClick={handlePrevImage}
                aria-label="Previous image"
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
            )}

            {/* Image */}
            {selectedImageIndex !== null && event.gallery && (
              <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
                <Image
                  src={event.gallery[selectedImageIndex].trim()}
                  alt={`${localizedTitle} - Image ${selectedImageIndex + 1}`}
                  width={1200}
                  height={800}
                  className="w-auto h-full object-contain"
                  sizes="90vw"
                  priority
                />
              </div>
            )}

            {/* Next Button */}
            {event.gallery && event.gallery.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 z-50 text-white hover:bg-white/20 h-12 w-12 cursor-pointer"
                onClick={handleNextImage}
                aria-label="Next image"
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            )}

            {/* Image Counter */}
            {event.gallery &&
              event.gallery.length > 1 &&
              selectedImageIndex !== null && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                  {selectedImageIndex + 1} / {event.gallery.length}
                </div>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
