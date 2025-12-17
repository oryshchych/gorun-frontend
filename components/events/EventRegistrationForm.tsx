"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registrationSchema,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Event } from "@/types/event";

interface EventRegistrationFormProps {
  event: Event;
  onSubmit: (data: RegistrationFormData) => void | Promise<void>;
  isLoading?: boolean;
  promoCodeDiscount?: {
    discountType: "percentage" | "amount";
    discountValue: number;
  } | null;
  onPromoCodeCheck?: (code: string) => Promise<void>;
}

export function EventRegistrationForm({
  event,
  onSubmit,
  isLoading = false,
  promoCodeDiscount,
  onPromoCodeCheck,
}: EventRegistrationFormProps) {
  const t = useTranslations("event");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const [isCheckingPromoCode, setIsCheckingPromoCode] = useState(false);
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema) as any,
    defaultValues: {
      eventId: event.id,
      name: "",
      surname: "",
      email: "",
      city: "",
      runningClub: "",
      phone: "",
      promoCode: "",
    },
  });

  const watchPromoCode = form.watch("promoCode");

  const handlePromoCodeBlur = async () => {
    const promoCode = watchPromoCode?.trim();
    if (!promoCode || !onPromoCodeCheck) return;

    setIsCheckingPromoCode(true);
    setPromoCodeError(null);

    try {
      await onPromoCodeCheck(promoCode);
    } catch (error: any) {
      setPromoCodeError(
        error?.response?.data?.message || t("promoCodeInvalid")
      );
    } finally {
      setIsCheckingPromoCode(false);
    }
  };

  const handleSubmit = async (data: RegistrationFormData) => {
    await onSubmit(data);
  };

  // Calculate price (sourced from event; defaults to 0 if missing)
  const basePrice = event.basePrice ?? 0;
  const discountAmount =
    promoCodeDiscount?.discountType === "percentage"
      ? (basePrice * promoCodeDiscount.discountValue) / 100
      : promoCodeDiscount?.discountType === "amount"
        ? promoCodeDiscount.discountValue
        : 0;
  const finalPrice = Math.max(0, basePrice - discountAmount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("register")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
            aria-label="Event registration form"
          >
            {/* Name - Required */}
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

            {/* Surname - Required */}
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

            {/* Email - Required */}
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

            {/* City - Required */}
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

            {/* Running Club - Optional */}
            <FormField
              control={form.control}
              name="runningClub"
              render={({ field, fieldState }) => (
                <AnimatedFormField error={fieldState.error?.message}>
                  <FormItem>
                    <FormLabel htmlFor="registration-running-club">
                      {t("runningClub")}
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

            {/* Phone - Optional */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <AnimatedFormField error={fieldState.error?.message}>
                  <FormItem>
                    <FormLabel htmlFor="registration-phone">
                      {t("phone")}
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

            {/* Promo Code - Optional */}
            <FormField
              control={form.control}
              name="promoCode"
              render={({ field, fieldState }) => (
                <AnimatedFormField
                  error={
                    fieldState.error?.message || promoCodeError || undefined
                  }
                >
                  <FormItem>
                    <FormLabel htmlFor="registration-promo-code">
                      {t("promoCode")}
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input
                          id="registration-promo-code"
                          placeholder={t("promoCodePlaceholder")}
                          {...field}
                          disabled={isLoading || isCheckingPromoCode}
                          onBlur={handlePromoCodeBlur}
                          aria-invalid={!!fieldState.error || !!promoCodeError}
                        />
                        {isCheckingPromoCode && (
                          <p className="text-sm text-muted-foreground">
                            {t("checkingPromoCode")}...
                          </p>
                        )}
                        {promoCodeDiscount && (
                          <p className="text-sm text-brand">
                            {t("promoCodeApplied")}:{" "}
                            {promoCodeDiscount.discountType === "percentage"
                              ? `${promoCodeDiscount.discountValue}%`
                              : `${promoCodeDiscount.discountValue} UAH`}{" "}
                            {t("discount")}
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </AnimatedFormField>
              )}
            />

            {/* Price Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("basePrice")}:</span>
                <span>{basePrice} UAH</span>
              </div>
              {promoCodeDiscount && discountAmount > 0 && (
                <div className="flex justify-between text-sm text-brand">
                  <span>{t("discount")}:</span>
                  <span>
                    -{discountAmount} UAH (
                    {promoCodeDiscount.discountType === "percentage"
                      ? `${promoCodeDiscount.discountValue}%`
                      : `${promoCodeDiscount.discountValue} UAH`}
                    )
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span>{t("total")}:</span>
                <span>{finalPrice} UAH</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || isCheckingPromoCode}
              className="w-full cursor-pointer"
              size="lg"
              aria-label={t("proceedToPayment")}
            >
              {isLoading && (
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              {t("proceedToPayment")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
