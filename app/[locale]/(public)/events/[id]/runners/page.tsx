"use server";

import { notFound } from "next/navigation";
import { Participant } from "@/types/registration";
import { Event } from "@/types/event";
import { getLocalizedString } from "@/lib/utils";
import { ParticipantsList } from "@/components/events/ParticipantsList";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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

async function fetchParticipants(id: string): Promise<Participant[]> {
  try {
    const res = await fetch(`${API_BASE}/api/events/${id}/participants`, {
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
  const title = event
    ? getLocalizedString(
        event.translations?.title,
        locale,
        "en",
        event.title || ""
      )
    : "Runners";
  return { title: `Runners — ${title}` };
}

export default async function PublicRunnersPage({
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

  // Collect unique distances from participants
  const distanceOptions = Array.from(
    new Set(
      participants
        .map((p) => (p as Participant & { distance?: string }).distance)
        .filter((distance): distance is string => Boolean(distance))
    )
  );

  return (
    <div
      style={{
        background: "var(--gr-bg)",
        color: "var(--gr-ink)",
        minHeight: "100vh",
        paddingBottom: 100,
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 18px" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Link
            href={`/${locale}/events/${id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "var(--gr-ink-3)",
              fontWeight: 600,
              textDecoration: "none",
              marginBottom: 12,
            }}
          >
            <ArrowLeft size={15} />
            Back to event
          </Link>
          <h1
            className="gr-display"
            style={{ fontSize: 32, fontWeight: 800, margin: 0 }}
          >
            Runners
          </h1>
          <p style={{ fontSize: 14, color: "var(--gr-ink-3)", marginTop: 4 }}>
            {title} · {participants.length} registered
          </p>
        </div>

        <ParticipantsList
          participants={participants}
          distances={distanceOptions}
        />
      </div>
    </div>
  );
}
