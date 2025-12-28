"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createRegistrationSchema,
  RegistrationFormData,
} from "@/lib/validations/registration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PublicRegistrationFormProps {
  eventId: string;
  onSubmit: (data: RegistrationFormData) => Promise<void>;
  isLoading?: boolean;
}

export function PublicRegistrationForm({
  eventId,
  onSubmit,
  isLoading = false,
}: PublicRegistrationFormProps) {
  const t = useTranslations("registration");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(createRegistrationSchema(tValidation)),
    defaultValues: {
      eventId,
      name: "",
      surname: "",
      email: "",
      city: "",
      runningClub: "",
      phone: "",
      promoCode: "",
    },
  });

  const handleSubmit = async (data: RegistrationFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
        aria-label="Registration form"
      >
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <AnimatedFormField error={fieldState.error?.message}>
              <FormItem>
                <FormLabel htmlFor="registration-name">
                  {t("name")} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="registration-name"
                    placeholder={t("namePlaceholder")}
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

        {/* Surname */}
        <FormField
          control={form.control}
          name="surname"
          render={({ field, fieldState }) => (
            <AnimatedFormField error={fieldState.error?.message}>
              <FormItem>
                <FormLabel htmlFor="registration-surname">
                  {t("surname")} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="registration-surname"
                    placeholder={t("surnamePlaceholder")}
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

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <AnimatedFormField error={fieldState.error?.message}>
              <FormItem>
                <FormLabel htmlFor="registration-email">
                  {t("email")} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="registration-email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
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

        {/* City */}
        <FormField
          control={form.control}
          name="city"
          render={({ field, fieldState }) => (
            <AnimatedFormField error={fieldState.error?.message}>
              <FormItem>
                <FormLabel htmlFor="registration-city">
                  {t("city")} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="registration-city"
                    placeholder={t("cityPlaceholder")}
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

        {/* Running Club (Optional) */}
        <FormField
          control={form.control}
          name="runningClub"
          render={({ field, fieldState }) => (
            <AnimatedFormField error={fieldState.error?.message}>
              <FormItem>
                <FormLabel htmlFor="registration-running-club">
                  {t("runningClub")} ({tCommon("optional")})
                </FormLabel>
                <FormControl>
                  <Input
                    id="registration-running-club"
                    placeholder={t("runningClubPlaceholder")}
                    {...field}
                    disabled={isLoading}
                    aria-invalid={!!fieldState.error}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </AnimatedFormField>
          )}
        />

        {/* Phone (Optional) */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field, fieldState }) => (
            <AnimatedFormField error={fieldState.error?.message}>
              <FormItem>
                <FormLabel htmlFor="registration-phone">
                  {t("phone")} ({tCommon("optional")})
                </FormLabel>
                <FormControl>
                  <Input
                    id="registration-phone"
                    type="tel"
                    placeholder={t("phonePlaceholder")}
                    {...field}
                    disabled={isLoading}
                    aria-invalid={!!fieldState.error}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </AnimatedFormField>
          )}
        />

        {/* Promo Code (Optional) */}
        <FormField
          control={form.control}
          name="promoCode"
          render={({ field, fieldState }) => (
            <AnimatedFormField error={fieldState.error?.message}>
              <FormItem>
                <FormLabel htmlFor="registration-promo-code">
                  {t("promoCode")} ({tCommon("optional")})
                </FormLabel>
                <FormControl>
                  <Input
                    id="registration-promo-code"
                    placeholder={t("promoCodePlaceholder")}
                    {...field}
                    disabled={isLoading}
                    aria-invalid={!!fieldState.error}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </AnimatedFormField>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
          size="lg"
          aria-label={t("submitRegistration")}
        >
          {isLoading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {isLoading ? t("processing") : t("proceedToPayment")}
        </Button>
      </form>
    </Form>
  );
}
