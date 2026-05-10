"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { use } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AdminEventForm } from "@/components/admin/AdminEventForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEvent, useUpdateEvent } from "@/hooks/useEvents";
import {
  adminFormToUpdatePayload,
  eventToAdminFormDefaults,
} from "@/lib/validations/admin-event";
import type { AdminEventFormData } from "@/lib/validations/admin-event";

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

export default function AdminEditEventPage({ params }: Props) {
  const { id } = use(params);
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("admin.events");
  const tCommon = useTranslations("common");

  const { data: event, isLoading, error } = useEvent(id);
  const updateEvent = useUpdateEvent(id);

  const handleSubmit = async (data: AdminEventFormData) => {
    try {
      await updateEvent.mutateAsync(adminFormToUpdatePayload(data));
      router.push(`/${locale}/admin/events`);
    } catch {
      /* mutation handles toast */
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="p-6 md:p-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/${locale}/admin/events`}>
            <ArrowLeft className="mr-2 size-4" />
            {tCommon("back")}
          </Link>
        </Button>
        <p className="text-destructive">
          {error?.message ?? "Event not found"}
        </p>
      </div>
    );
  }

  const defaults = eventToAdminFormDefaults(event);

  return (
    <div className="p-6 md:p-8">
      <Button variant="ghost" asChild className="mb-6 -ml-2">
        <Link href={`/${locale}/admin/events`}>
          <ArrowLeft className="mr-2 size-4" />
          {tCommon("back")}
        </Link>
      </Button>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl">{t("edit")}</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminEventForm
            key={event.id}
            defaultValues={defaults}
            onSubmit={handleSubmit}
            isLoading={updateEvent.isPending}
            submitLabel={tCommon("save")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
