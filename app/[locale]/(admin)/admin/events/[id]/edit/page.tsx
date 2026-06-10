"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AdminEventForm } from "@/components/admin/AdminEventForm";
import { ShellPageHeader } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const tForm = useTranslations("admin.eventForm");
  const tCommon = useTranslations("common");

  const { data: event, isLoading, error } = useEvent(id);
  const updateEvent = useUpdateEvent(id);
  const [savedOk, setSavedOk] = useState(false);

  const handleSubmit = async (data: AdminEventFormData) => {
    try {
      await updateEvent.mutateAsync(adminFormToUpdatePayload(data));
      setSavedOk(true);
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
          onClose={() => router.push(`/${locale}/admin/events`)}
          isLoading={updateEvent.isPending}
          submitLabel={tCommon("save")}
          eventId={id}
        />
      </div>

      <Dialog open={savedOk} onOpenChange={(open) => { if (!open) setSavedOk(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tForm("savedTitle")}</DialogTitle>
            <DialogDescription>{tForm("savedDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="brand" onClick={() => setSavedOk(false)}>
              {tForm("savedClose")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
