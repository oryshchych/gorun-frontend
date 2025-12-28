import { Metadata } from "next";
import {
  generateMetadata as generateSEOMetadata,
  generateEventStructuredData,
} from "@/lib/seo";
import { getLocalizedString } from "@/lib/utils";
import { siteConfig } from "@/lib/seo";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function fetchEvent(id: string, locale: string) {
  try {
    const res = await fetch(`${API_BASE}/api/events/${id}?lang=${locale}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return null;
    }
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;
  const event = await fetchEvent(id, locale);

  if (!event) {
    return generateSEOMetadata({
      locale,
      title: "Event Not Found",
      path: `/events/${id}`,
      noIndex: true,
    });
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

  return generateSEOMetadata({
    locale,
    title: localizedTitle,
    description: localizedDescription,
    image: event.imageUrl?.landscape || event.imageUrl?.portrait,
    path: `/events/${id}`,
  });
}

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
