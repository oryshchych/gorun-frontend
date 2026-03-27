"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { getEvents } from "@/lib/api/events";
import {
  createAdminPromoCode,
  updateAdminPromoCode,
} from "@/lib/api/admin-promo-codes";
import {
  createAdminPromoCodeSchema,
  type AdminPromoCodeFormValues,
} from "@/lib/validations/admin-promo-code";
import type { AdminPromoCode } from "@/types/promo-code";
import type { Event } from "@/types/event";
import { getLocalizedString } from "@/lib/utils";
import { handleApiError } from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

function eventDisplayName(event: Event, locale: string): string {
  if (event.title?.trim()) return event.title.trim();
  const tr = event.translations?.title;
  if (tr) return getLocalizedString(tr, locale) || event.id;
  return event.id;
}

function promoToFormDefaults(promo: AdminPromoCode): AdminPromoCodeFormValues {
  const exp = promo.expirationDate?.trim();
  let dateInput = "";
  if (exp) {
    dateInput = exp.length >= 10 ? exp.slice(0, 10) : exp;
  }
  return {
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    eventId: promo.eventId,
    isActive: promo.isActive,
    usageLimit:
      promo.usageLimit != null && promo.usageLimit !== undefined
        ? String(promo.usageLimit)
        : "",
    expirationDate: dateInput,
  };
}

function formToPayload(values: AdminPromoCodeFormValues) {
  const usageLimitRaw = values.usageLimit.trim();
  const usageLimit =
    usageLimitRaw === "" ? undefined : parseInt(usageLimitRaw, 10);
  const expRaw = values.expirationDate.trim();
  const expirationDate = expRaw === "" ? undefined : expRaw;

  return {
    code: values.code.trim().toUpperCase(),
    discountType: values.discountType,
    discountValue: values.discountValue,
    eventId: values.eventId,
    isActive: values.isActive,
    ...(usageLimit !== undefined ? { usageLimit } : {}),
    ...(expirationDate !== undefined ? { expirationDate } : {}),
  };
}

const DEFAULTS: AdminPromoCodeFormValues = {
  code: "",
  discountType: "percentage",
  discountValue: 10,
  eventId: "",
  isActive: true,
  usageLimit: "",
  expirationDate: "",
};

export function PromoCodeForm({
  mode,
  promoId,
  initial,
  isLoadingInitial,
}: {
  mode: "create" | "edit";
  promoId?: string;
  initial?: AdminPromoCode | null;
  isLoadingInitial?: boolean;
}) {
  const t = useTranslations("admin.promoCodes");
  const tCommon = useTranslations("common");
  const tVal = useTranslations("admin.promoValidation");
  const tApi = useTranslations("apiCodes");
  const locale = useLocale();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const schema = useMemo(() => createAdminPromoCodeSchema(tVal), [tVal]);

  const form = useForm<AdminPromoCodeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
  });

  useEffect(() => {
    if (mode === "edit" && initial) {
      form.reset(promoToFormDefaults(initial));
    }
  }, [form, initial, mode]);

  const { data: eventsResult, isLoading: eventsLoading } = useQuery({
    queryKey: ["admin", "promo-form-events", locale],
    queryFn: () => getEvents({ limit: 100, lang: locale }),
  });

  const events = eventsResult?.data ?? [];

  const onSubmit = async (values: AdminPromoCodeFormValues) => {
    setSubmitting(true);
    try {
      const payload = formToPayload(values);
      if (mode === "create") {
        await createAdminPromoCode(payload);
      } else if (promoId) {
        const expRaw = values.expirationDate.trim();
        const limitRaw = values.usageLimit.trim();
        await updateAdminPromoCode(promoId, {
          code: payload.code,
          discountType: payload.discountType,
          discountValue: payload.discountValue,
          eventId: payload.eventId,
          isActive: payload.isActive,
          usageLimit:
            limitRaw === "" ? null : Number.parseInt(limitRaw, 10),
          expirationDate: expRaw === "" ? null : expRaw,
        });
      }
      toast.success(t("saved"));
      router.push(`/${locale}/admin/promo-codes`);
    } catch (err) {
      handleApiError(err, undefined, tApi);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoadingInitial) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-lg space-y-6"
      >
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("codeLabel")}</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" disabled={mode === "edit"} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discountType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("discountTypeLabel")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={submitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="percentage">
                    {t("discountTypePercentage")}
                  </SelectItem>
                  <SelectItem value="fixed">{t("discountTypeFixed")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discountValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("discountValueLabel")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={field.value}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    field.onChange(Number.isNaN(v) ? 0 : v);
                  }}
                  disabled={submitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="eventId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("eventLabel")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={submitting || eventsLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectEvent")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {events.map((ev) => (
                    <SelectItem key={ev.id} value={ev.id}>
                      {eventDisplayName(ev, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onChange={() => field.onChange(!field.value)}
                  disabled={submitting}
                />
              </FormControl>
              <FormLabel className="mt-0! font-normal cursor-pointer">
                {t("isActiveLabel")}
              </FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="usageLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("usageLimitLabel")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  inputMode="numeric"
                  placeholder="—"
                  disabled={submitting}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                {t("usageLimitHint")}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expirationDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("expirationLabel")}</FormLabel>
              <FormControl>
                <Input {...field} type="date" disabled={submitting} />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                {t("expirationHint")}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting || eventsLoading}>
            {submitting && (
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            )}
            {tCommon("save")}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => router.push(`/${locale}/admin/promo-codes`)}
          >
            {tCommon("cancel")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
