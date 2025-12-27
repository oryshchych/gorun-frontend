"use client";

import { useEvent } from "@/hooks/useEvents";
import { EventDetails } from "@/components/events/EventDetails";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { use } from "react";
import { generateEventStructuredData } from "@/lib/seo";
import { getLocalizedString } from "@/lib/utils";
import { siteConfig } from "@/lib/seo";

interface EventDetailsPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default function EventDetailsPage({ params }: EventDetailsPageProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const { data: event, isLoading, error } = useEvent(id, locale);

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("back")}
        </Button>
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error?.message || "Event not found"}
        </div>
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
    url: `${siteConfig.url}/${locale}/events/${event.id}`,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" onClick={handleBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("back")}
        </Button>

        <EventDetails event={event} />
      </div>
    </>
  );
}
