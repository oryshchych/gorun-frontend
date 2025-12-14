"use client";

import { useEvent, useUpdateEvent } from "@/hooks/useEvents";
import { EventForm } from "@/components/events/EventForm";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { EventFormData } from "@/lib/validations/event";
import { use } from "react";
import { useAuth } from "@/hooks/useAuth";

interface EditEventPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default function EditEventPage({ params }: EditEventPageProps) {
  const t = useTranslations("events");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { user } = useAuth();

  const { data: event, isLoading, error } = useEvent(id);
  const updateEvent = useUpdateEvent(id);

  const handleSubmit = async (data: EventFormData) => {
    try {
      await updateEvent.mutateAsync(data);
      router.push(`/${locale}/events/${id}`);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

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
          {tCommon("back")}
        </Button>
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error?.message || "Event not found"}
        </div>
      </div>
    );
  }

  // Check if user is the organizer
  if (user?.id !== event.organizerId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {tCommon("back")}
        </Button>
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          You are not authorized to edit this event
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" onClick={handleBack} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        {tCommon("back")}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("editEvent")}</CardTitle>
        </CardHeader>
        <CardContent>
          <EventForm
            onSubmit={handleSubmit}
            defaultValues={event}
            isLoading={updateEvent.isPending}
            submitLabel={tCommon("save")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
