"use server";

import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
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
  const [event, t] = await Promise.all([
    fetchEvent(id, locale),
    getTranslations({ locale, namespace: "runners" }),
  ]);
  const title = event
    ? getLocalizedString(
        event.translations?.title,
        locale,
        "en",
        event.title || ""
      )
    : "";
  return { title: title ? `${t("title")} — ${title}` : t("title") };
}

export default async function PublicRunnersPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const [event, participants, t] = await Promise.all([
    fetchEvent(id, locale),
    fetchParticipants(id),
    getTranslations({ locale, namespace: "runners" }),
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
    <div className="min-h-screen bg-bg pb-25 text-ink">
      <div className="mx-auto max-w-7xl px-4.5 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/${locale}/events/${id}`}
            className="mb-3 inline-flex items-center gap-1.5 rounded-sm text-[13px] font-semibold text-ink-3 no-underline transition-colors hover:text-ink"
          >
            <ArrowLeft size={15} />
            {t("backToEvent")}
          </Link>
          <h1 className="gr-display m-0 text-[32px] font-extrabold">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-ink-3">
            {title} · {t("registered", { count: participants.length })}
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
