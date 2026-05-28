"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminEventForm } from "@/components/admin/AdminEventForm";
import { ShellPageHeader } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { useCreateEvent } from "@/hooks/useEvents";
import {
  adminFormToCreatePayload,
  createEmptyAdminEventForm,
} from "@/lib/validations/admin-event";
import type { AdminEventFormData } from "@/lib/validations/admin-event";

export default function AdminNewEventPage() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("admin.events");
  const tCommon = useTranslations("common");
  const createEvent = useCreateEvent();

  const defaultValues = useMemo(() => createEmptyAdminEventForm(), []);

  const handleSubmit = async (data: AdminEventFormData) => {
    try {
      const payload = adminFormToCreatePayload(data);
      const created = await createEvent.mutateAsync(payload);
      router.push(`/${locale}/admin/events/${created.id}/edit`);
    } catch {
      /* toast via mutation */
    }
  };

  return (
    <>
      <Button variant="ghost" asChild className="mb-4 -ml-2">
        <Link href={`/${locale}/admin/events`}>
          <ArrowLeft className="mr-2 size-4" />
          {tCommon("back")}
        </Link>
      </Button>

      <ShellPageHeader title={t("create")} className="mb-6" />

      <div className="shell-surface max-w-4xl rounded-lg border p-4 shadow-sm md:p-6">
        <AdminEventForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isLoading={createEvent.isPending}
          submitLabel={tCommon("create")}
        />
      </div>
    </>
  );
}
