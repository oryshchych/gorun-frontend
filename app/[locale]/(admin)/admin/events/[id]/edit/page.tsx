"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { use } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AdminEventForm } from "@/components/admin/AdminEventForm";
import { ShellPageHeader } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
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
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin shell-ink-muted" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <>
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/${locale}/admin/events`}>
            <ArrowLeft className="mr-2 size-4" />
            {tCommon("back")}
          </Link>
        </Button>
        <p className="text-destructive">
          {error?.message ?? "Event not found"}
        </p>
      </>
    );
  }

  const defaults = eventToAdminFormDefaults(event);

  return (
    <>
      <Button variant="ghost" asChild className="mb-4 -ml-2">
        <Link href={`/${locale}/admin/events`}>
          <ArrowLeft className="mr-2 size-4" />
          {tCommon("back")}
        </Link>
      </Button>

      <ShellPageHeader title={t("edit")} className="mb-6" />

      <div className="shell-surface max-w-4xl rounded-lg border p-4 shadow-sm md:p-6">
        <AdminEventForm
          key={event.id}
          defaultValues={defaults}
          onSubmit={handleSubmit}
          isLoading={updateEvent.isPending}
          submitLabel={tCommon("save")}
          eventId={id}
        />
      </div>
    </>
  );
}
