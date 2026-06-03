"use server";

import { getTranslations } from "next-intl/server";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { EventsHub } from "@/components/events/EventsHub";
import { Event, PastEvent } from "@/types/event";
import { getLocalizedString } from "@/lib/utils";
import { generateMetadata as generateSEOMetadata, siteConfig } from "@/lib/seo";
import type { Metadata } from "next";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/api$/, "");

async function fetchUpcomingEvents(locale: string): Promise<Event[]> {
  try {
    const res = await fetch(
      `${API_BASE}/api/events?status=UPCOMING&lang=${locale}&limit=20`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const json = await res.json();
    // API returns { success: true, data: [...], pagination: {...} }
    const raw = json?.data;
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

async function fetchPastEvents(locale: string): Promise<PastEvent[]> {
  try {
    const res = await fetch(
      `${API_BASE}/api/events?status=FINISHED&lang=${locale}&limit=10`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const raw = json?.data;
    if (!Array.isArray(raw)) return [];
    return raw.map((e: Event) => ({
      id: e.id,
      name:
        e.resolvedTitle ||
        getLocalizedString(e.translations?.title, locale, "en", e.title || ""),
      dateLabel: e.dateLabel || "",
      city: e.city || e.location || "",
      cover: e.cover || e.imageUrl?.landscape || e.imageUrl?.portrait || "",
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
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

  const [events, pastEvents] = await Promise.all([
    fetchUpcomingEvents(locale),
    fetchPastEvents(locale),
  ]);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">
        <EventsHub events={events} pastEvents={pastEvents} />
      </main>
      <Footer />
    </div>
  );
}
