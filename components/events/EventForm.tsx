'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventSchema, EventFormData } from '@/lib/validations/event';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { AnimatedFormField } from '@/components/shared/AnimatedFormField';
import { useTranslations } from 'next-intl';
import { Event } from '@/types/event';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

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
  const t = useTranslations('events');
  const tCommon = useTranslations('common');
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    defaultValues?.imageUrl
  );

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      date: defaultValues?.date || new Date(),
      location: defaultValues?.location || '',
      capacity: defaultValues?.capacity || 50,
      imageUrl: defaultValues?.imageUrl || '',
    },
  });

  const watchImageUrl = form.watch('imageUrl');

  useEffect(() => {
    if (watchImageUrl && watchImageUrl.trim() !== '') {
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
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" aria-label="Event form">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <AnimatedFormField error={fieldState.error?.message}>
              <FormItem>
                <FormLabel htmlFor="event-title">{t('eventTitle')}</FormLabel>
                <FormControl>
                  <Input
                    id="event-title"
                    placeholder={t('eventTitle')}
                    {...field}
                    disabled={isLoading}
                    aria-required="true"
                    aria-invalid={!!fieldState.error}
                    aria-describedby={fieldState.error ? "event-title-error" : undefined}
                  />
                </FormControl>
                <FormMessage id="event-title-error" />
              </FormItem>
            </AnimatedFormField>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <AnimatedFormField error={fieldState.error?.message}>
              <FormItem>
                <FormLabel htmlFor="event-description">{t('description')}</FormLabel>
                <FormControl>
                  <textarea
                    id="event-description"
                    placeholder={t('description')}
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    {...field}
                    disabled={isLoading}
                    aria-required="true"
                    aria-invalid={!!fieldState.error}
                    aria-describedby={fieldState.error ? "event-description-error" : undefined}
                  />
                </FormControl>
                <FormMessage id="event-description-error" />
              </FormItem>
            </AnimatedFormField>
          )}
        />

        {/* Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field, fieldState }) => (
            <AnimatedFormField error={fieldState.error?.message}>
              <FormItem>
                <FormLabel htmlFor="event-date">{t('date')}</FormLabel>
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
                    aria-describedby={fieldState.error ? "event-date-error" : undefined}
                  />
                </FormControl>
                <FormMessage id="event-date-error" />
              </FormItem>
            </AnimatedFormField>
          )}
        />

        {/* Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field, fieldState }) => (
            <AnimatedFormField error={fieldState.error?.message}>
              <FormItem>
                <FormLabel htmlFor="event-location">{t('location')}</FormLabel>
                <FormControl>
                  <Input
                    id="event-location"
                    placeholder={t('location')}
                    {...field}
                    disabled={isLoading}
                    aria-required="true"
                    aria-invalid={!!fieldState.error}
                    aria-describedby={fieldState.error ? "event-location-error" : undefined}
                  />
                </FormControl>
                <FormMessage id="event-location-error" />
              </FormItem>
            </AnimatedFormField>
          )}
        />

        {/* Capacity */}
        <FormField
          control={form.control}
          name="capacity"
          render={({ field, fieldState }) => (
            <AnimatedFormField error={fieldState.error?.message}>
              <FormItem>
                <FormLabel htmlFor="event-capacity">{t('capacity')}</FormLabel>
                <FormControl>
                  <Input
                    id="event-capacity"
                    type="number"
                    placeholder={t('capacity')}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    disabled={isLoading}
                    aria-required="true"
                    aria-invalid={!!fieldState.error}
                    aria-describedby={fieldState.error ? "event-capacity-error" : undefined}
                    min="1"
                  />
                </FormControl>
                <FormMessage id="event-capacity-error" />
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
                <FormLabel htmlFor="event-image-url">{t('imageUrl')}</FormLabel>
                <FormControl>
                  <Input
                    id="event-image-url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    {...field}
                    disabled={isLoading}
                    aria-invalid={!!fieldState.error}
                    aria-describedby={fieldState.error ? "event-image-url-error" : undefined}
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
            animate={{ opacity: 1, height: 'auto' }}
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
          aria-label={submitLabel || tCommon('submit')}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          {submitLabel || tCommon('submit')}
        </Button>
      </form>
    </Form>
  );
}
