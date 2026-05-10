"use server";

import { notFound, redirect } from "next/navigation";
import { Event } from "@/types/event";
import { getLocalizedString } from "@/lib/utils";
import { isRegistrationClosed } from "@/lib/event-registration";
import { RegistrationWizard } from "@/components/registration/RegistrationWizard";
import type { Metadata } from "next";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(
  /\/api$/,
  ""
);

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const event = await fetchEvent(id, locale);
  const title = event
    ? getLocalizedString(event.translations?.title, locale, "en", event.title || "")
    : "Register";
  return { title: `Register — ${title}` };
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const event = await fetchEvent(id, locale);

  if (!event) notFound();

  if (isRegistrationClosed(event)) {
    redirect(`/${locale}/events/${id}`);
  }

  return <RegistrationWizard event={event} locale={locale} />;
}
