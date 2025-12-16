"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, EventFormData } from "@/lib/validations/event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AnimatedFormField } from "@/components/shared/AnimatedFormField";
import { useTranslations } from "next-intl";
import { Event } from "@/types/event";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface EventFormProps {
  onSubmit: (data: EventFormData) => void | Promise<void>;
  defaultValues?: Partial<Event>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function EventForm({
  onSubmit,
  defaultValues,
  isLoading = false,
  submitLabel,
}: EventFormProps) {
  const t = useTranslations("events");
  const tCommon = useTranslations("common");
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    defaultValues?.imageUrl
  );

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      translations: {
        title: {
          en:
            defaultValues?.translations?.title?.en ||
            defaultValues?.title ||
            "",
          uk: defaultValues?.translations?.title?.uk || "",
        },
        description: {
          en:
            defaultValues?.translations?.description?.en ||
            defaultValues?.description ||
            "",
          uk: defaultValues?.translations?.description?.uk || "",
        },
        location: {
          en:
            defaultValues?.translations?.location?.en ||
            defaultValues?.location ||
            "",
          uk: defaultValues?.translations?.location?.uk || "",
        },
      },
      date: defaultValues?.date ? new Date(defaultValues.date) : new Date(),
      capacity: defaultValues?.capacity || 50,
      imageUrl: defaultValues?.imageUrl || "",
      basePrice: defaultValues?.basePrice ?? 0,
    },
  });

  const watchImageUrl = form.watch("imageUrl");

  useEffect(() => {
    if (watchImageUrl && watchImageUrl.trim() !== "") {
      // Validate URL format before setting preview
      try {
        new URL(watchImageUrl);
        setImagePreview(watchImageUrl);
      } catch {
        setImagePreview(undefined);
      }
    } else {
      setImagePreview(undefined);
    }
  }, [watchImageUrl]);

  const handleSubmit = async (data: EventFormData) => {
    await onSubmit(data);
  };

  // Format date for datetime-local input
  const formatDateForInput = (date: Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
        aria-label="Event form"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title EN */}
          <FormField
            control={form.control}
            name="translations.title.en"
            render={({ field, fieldState }) => (
              <AnimatedFormField error={fieldState.error?.message}>
                <FormItem>
                  <FormLabel htmlFor="event-title-en">
                    {t("eventTitleEn")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="event-title-en"
                      placeholder={t("eventTitleEn")}
                      {...field}
                      disabled={isLoading}
                      aria-required="true"
                      aria-invalid={!!fieldState.error}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </AnimatedFormField>
            )}
          />

          {/* Title UK */}
          <FormField
            control={form.control}
            name="translations.title.uk"
            render={({ field, fieldState }) => (
              <AnimatedFormField error={fieldState.error?.message}>
                <FormItem>
                  <FormLabel htmlFor="event-title-uk">
                    {t("eventTitleUk")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="event-title-uk"
                      placeholder={t("eventTitleUk")}
                      {...field}
                      disabled={isLoading}
                      aria-required="true"
                      aria-invalid={!!fieldState.error}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </AnimatedFormField>
            )}
          />
        </div>

        {/* Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="translations.description.en"
            render={({ field, fieldState }) => (
              <AnimatedFormField error={fieldState.error?.message}>
                <FormItem>
                  <FormLabel htmlFor="event-description-en">
                    {t("descriptionEn")}
                  </FormLabel>
                  <FormControl>
                    <textarea
                      id="event-description-en"
                      placeholder={t("descriptionEn")}
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      {...field}
                      disabled={isLoading}
                      aria-required="true"
                      aria-invalid={!!fieldState.error}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </AnimatedFormField>
            )}
          />

          <FormField
            control={form.control}
            name="translations.description.uk"
            render={({ field, fieldState }) => (
              <AnimatedFormField error={fieldState.error?.message}>
                <FormItem>
                  <FormLabel htmlFor="event-description-uk">
                    {t("descriptionUk")}
                  </FormLabel>
                  <FormControl>
                    <textarea
                      id="event-description-uk"
                      placeholder={t("descriptionUk")}
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      {...field}
                      disabled={isLoading}
                      aria-required="true"
                      aria-invalid={!!fieldState.error}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </AnimatedFormField>
            )}
          />
        </div>

        {/* Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field, fieldState }) => (
            <AnimatedFormField error={fieldState.error?.message}>
              <FormItem>
                <FormLabel htmlFor="event-date">{t("date")}</FormLabel>
                <FormControl>
                  <Input
                    id="event-date"
                    type="datetime-local"
                    {...field}
                    value={
                      field.value instanceof Date
                        ? formatDateForInput(field.value)
                        : field.value
                    }
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      field.onChange(date);
                    }}
                    disabled={isLoading}
                    aria-required="true"
                    aria-invalid={!!fieldState.error}
                    aria-describedby={
                      fieldState.error ? "event-date-error" : undefined
                    }
                  />
                </FormControl>
                <FormMessage id="event-date-error" />
              </FormItem>
            </AnimatedFormField>
          )}
        />

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="translations.location.en"
            render={({ field, fieldState }) => (
              <AnimatedFormField error={fieldState.error?.message}>
                <FormItem>
                  <FormLabel htmlFor="event-location-en">
                    {t("locationEn")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="event-location-en"
                      placeholder={t("locationEn")}
                      {...field}
                      disabled={isLoading}
                      aria-required="true"
                      aria-invalid={!!fieldState.error}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </AnimatedFormField>
            )}
          />

          <FormField
            control={form.control}
            name="translations.location.uk"
            render={({ field, fieldState }) => (
              <AnimatedFormField error={fieldState.error?.message}>
                <FormItem>
                  <FormLabel htmlFor="event-location-uk">
                    {t("locationUk")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="event-location-uk"
                      placeholder={t("locationUk")}
                      {...field}
                      disabled={isLoading}
                      aria-required="true"
                      aria-invalid={!!fieldState.error}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </AnimatedFormField>
            )}
          />
        </div>

        {/* Capacity */}
        <FormField
          control={form.control}
          name="capacity"
          render={({ field, fieldState }) => (
            <AnimatedFormField error={fieldState.error?.message}>
              <FormItem>
                <FormLabel htmlFor="event-capacity">{t("capacity")}</FormLabel>
                <FormControl>
                  <Input
                    id="event-capacity"
                    type="number"
                    placeholder={t("capacity")}
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value, 10))
                    }
                    disabled={isLoading}
                    aria-required="true"
                    aria-invalid={!!fieldState.error}
                    aria-describedby={
                      fieldState.error ? "event-capacity-error" : undefined
                    }
                    min="1"
                  />
                </FormControl>
                <FormMessage id="event-capacity-error" />
              </FormItem>
            </AnimatedFormField>
          )}
        />

        {/* Base Price */}
        <FormField
          control={form.control}
          name="basePrice"
          render={({ field, fieldState }) => (
            <AnimatedFormField error={fieldState.error?.message}>
              <FormItem>
                <FormLabel htmlFor="event-base-price">
                  {t("basePrice")}
                </FormLabel>
                <FormControl>
                  <Input
                    id="event-base-price"
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                    disabled={isLoading}
                    aria-invalid={!!fieldState.error}
                    min="0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </AnimatedFormField>
          )}
        />

        {/* Image URL */}
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field, fieldState }) => (
            <AnimatedFormField error={fieldState.error?.message}>
              <FormItem>
                <FormLabel htmlFor="event-image-url">{t("imageUrl")}</FormLabel>
                <FormControl>
                  <Input
                    id="event-image-url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    {...field}
                    disabled={isLoading}
                    aria-invalid={!!fieldState.error}
                    aria-describedby={
                      fieldState.error ? "event-image-url-error" : undefined
                    }
                  />
                </FormControl>
                <FormMessage id="event-image-url-error" />
              </FormItem>
            </AnimatedFormField>
          )}
        />

        {/* Image Preview */}
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-48 rounded-lg overflow-hidden border"
            role="img"
            aria-label="Event image preview"
          >
            <Image
              src={imagePreview}
              alt="Event image preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </motion.div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
          aria-label={submitLabel || tCommon("submit")}
        >
          {isLoading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {submitLabel || tCommon("submit")}
        </Button>
      </form>
    </Form>
  );
}
