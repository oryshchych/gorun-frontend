"use server";

import { notFound } from "next/navigation";
import { Event } from "@/types/event";
import { Participant } from "@/types/registration";
import { getLocalizedString } from "@/lib/utils";
import {
  generateMetadata as generateSEOMetadata,
  generateEventStructuredData,
  siteConfig,
} from "@/lib/seo";
import { EventDetailClient } from "@/components/events/EventDetailClient";
import type { Metadata } from "next";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/api$/, "");

async function fetchEvent(id: string, locale: string): Promise<Event | null> {
  try {
    const res = await fetch(`${API_BASE}/api/events/${id}?lang=${locale}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as Event;
  } catch {
    return null;
  }
}

async function fetchParticipants(eventId: string): Promise<Participant[]> {
  try {
    const res = await fetch(`${API_BASE}/api/events/${eventId}/participants`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []) as Participant[];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const event = await fetchEvent(id, locale);
  if (!event) return {};

  const title = getLocalizedString(
    event.translations?.title,
    locale,
    "en",
    event.title || ""
  );
  const description = getLocalizedString(
    event.translations?.description,
    locale,
    "en",
    event.description || ""
  );
  return generateSEOMetadata({
    locale,
    title,
    description: description.slice(0, 160),
    image: event.imageUrl?.landscape || event.imageUrl?.portrait,
    path: `events/${id}`,
  });
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const [event, participants] = await Promise.all([
    fetchEvent(id, locale),
    fetchParticipants(id),
  ]);

  if (!event) notFound();

  const title = getLocalizedString(
    event.translations?.title,
    locale,
    "en",
    event.title || ""
  );
  const description = getLocalizedString(
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
    title,
    description,
    date: new Date(event.date).toISOString(),
    location: localizedLocation,
    imageUrl: event.imageUrl,
    basePrice: event.basePrice,
    capacity: event.capacity,
    registeredCount: event.registeredCount,
    locale,
    url: `${siteConfig.url}/${locale}/events/${event.id}`,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <EventDetailClient
        event={event}
        participants={participants}
        locale={locale}
      />
    </>
  );
}
