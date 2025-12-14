"use client";

import { EventForm } from "@/components/events/EventForm";
import { useCreateEvent } from "@/hooks/useEvents";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EventFormData } from "@/lib/validations/event";

export default function CreateEventPage() {
  const t = useTranslations("events");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const createEvent = useCreateEvent();

  const handleSubmit = async (data: EventFormData) => {
    try {
      const newEvent = await createEvent.mutateAsync(data);
      router.push(`/${locale}/events/${newEvent.id}`);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" onClick={handleBack} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("createEvent")}</CardTitle>
        </CardHeader>
        <CardContent>
          <EventForm
            onSubmit={handleSubmit}
            isLoading={createEvent.isPending}
            submitLabel={tNav("createEvent")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
