"use server";

import { getTranslations } from "next-intl/server";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import HomePageClient from "@/components/events/HomePageClient";
import { Event } from "@/types/event";
import { Participant } from "@/types/registration";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { generateEventStructuredData } from "@/lib/seo";
import { getLocalizedString } from "@/lib/utils";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/seo";

// For MVP: We'll use a fixed event ID or fetch the first event
// In production, this would come from environment or API endpoint
const SINGLE_EVENT_ID = process.env.NEXT_PUBLIC_SINGLE_EVENT_ID || "single";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function fetchEvent(locale: string): Promise<Event> {
  const res = await fetch(
    `${API_BASE}/api/events/${SINGLE_EVENT_ID}?lang=${locale}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch event: ${res.status}`);
  }
  const json = await res.json();
  return json.data as Event;
}

async function fetchParticipants(eventId: string): Promise<Participant[]> {
  const res = await fetch(`${API_BASE}/api/events/${eventId}/participants`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch participants: ${res.status}`);
  }
  const json = await res.json();
  return json.data as Participant[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  let event: Event | null = null;

  try {
    event = await fetchEvent(locale);
  } catch (error) {
    // If event not found, return default metadata
  }

  // Get translations for fallback title
  const t = await getTranslations({ locale });

  if (event) {
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

    // Use home.title as the main title, event title as description context
    return generateSEOMetadata({
      locale,
      title: t("home.title") || siteConfig.name,
      description:
        localizedDescription ||
        t("home.subtitle") ||
        siteConfig.description[locale as keyof typeof siteConfig.description],
      image: event.imageUrl?.landscape || event.imageUrl?.portrait,
      path: "",
    });
  }

  return generateSEOMetadata({
    locale,
    title: t("home.title") || siteConfig.name,
    description: t("home.subtitle") || undefined,
    path: "",
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

  let event: Event | null = null;
  let participants: Participant[] = [];

  try {
    event = await fetchEvent(locale);
    participants = await fetchParticipants(event.id);
  } catch (error) {
    console.error("HomePage data fetch error:", error);
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">
              {t("errors.eventNotFound")}
            </h1>
            <p className="text-muted-foreground">
              {t("errors.notFoundDescription")}
            </p>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

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

  const structuredData = generateEventStructuredData({
    id: event.id,
    title: localizedTitle,
    description: localizedDescription,
    date: new Date(event.date).toISOString(),
    location: localizedLocation,
    imageUrl: event.imageUrl,
    basePrice: event.basePrice,
    capacity: event.capacity,
    registeredCount: event.registeredCount,
    locale,
    url: `${siteConfig.url}/${locale}`,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <HomePageClient
              event={event}
              participants={participants}
              locale={locale}
            />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
