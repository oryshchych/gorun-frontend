"use server";

import { getTranslations } from "next-intl/server";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import HomePageClient from "@/components/events/HomePageClient";
import { Event } from "@/types/event";
import { Participant } from "@/types/registration";

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

  return (
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
  );
}
