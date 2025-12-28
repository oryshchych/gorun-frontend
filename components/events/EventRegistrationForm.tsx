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
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Event } from "@/types/event";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { agreements } from "@/content/agreements";

interface EventRegistrationFormProps {
  event: Event;
  onSubmit: (data: RegistrationFormData) => void | Promise<void>;
  isLoading?: boolean;
  promoCodeDiscount?: {
    discountType: "percentage" | "fixed";
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
  const tFooter = useTranslations("footer");
  const tValidation = useTranslations("validation");
  const locale = useLocale();
  const [isCheckingPromoCode, setIsCheckingPromoCode] = useState(false);
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [privacyContent, setPrivacyContent] = useState<string>("");
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [termsContent, setTermsContent] = useState<string>("");

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(createRegistrationSchema(tValidation)) as any,
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

  const validatePromoCodeInput = async () => {
    const promoCode = watchPromoCode?.trim();
    if (!onPromoCodeCheck) return;

    // No code -> just reset UI, no network request
    if (!promoCode) {
      setPromoCodeError(null);
      return;
    }

    setIsCheckingPromoCode(true);
    setPromoCodeError(null);

    try {
      await onPromoCodeCheck(promoCode);
    } catch (error: any) {
      setPromoCodeError(
        error?.response?.data?.message ||
          error?.message ||
          t("promoCodeInvalid")
      );
    } finally {
      setIsCheckingPromoCode(false);
    }
  };

  const handleSubmit = async (data: RegistrationFormData) => {
    await onSubmit(data);
  };

  const loadMarkdownContent = async (
    filePath: string,
    errorMessageUk: string,
    errorMessageEn: string
  ): Promise<string> => {
    try {
      const response = await fetch(filePath, {
        headers: {
          Accept: "text/plain",
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      const text = await response.text();
      // Check if we got HTML instead of markdown
      if (
        text.trim().startsWith("<!DOCTYPE") ||
        text.trim().startsWith("<html")
      ) {
        throw new Error("Received HTML instead of markdown");
      }
      return text;
    } catch (error) {
      console.error("Failed to load markdown:", error);
      return locale === "uk" ? errorMessageUk : errorMessageEn;
    }
  };

  const handlePrivacyClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!privacyContent) {
      // const content = await loadMarkdownContent(
      //   "/content/privacy-policy-uk.md",
      //   "Контент політики конфіденційності не вдалося завантажити.",
      //   "Privacy policy content could not be loaded."
      // );
      const content = agreements.privacyPolicy;
      setPrivacyContent(content);
    }
    setIsPrivacyOpen(true);
  };

  const handleTermsClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!termsContent) {
      // const content = await loadMarkdownContent(
      //   "/content/terms-of-service-uk.md",
      //   "Контент умов використання не вдалося завантажити.",
      //   "Terms of service content could not be loaded."
      // );
      const content = agreements.termsOfService;
      setTermsContent(content);
    }
    setIsTermsOpen(true);
  };

  // Calculate price (sourced from event; defaults to 0 if missing)
  const basePrice = event.basePrice ?? 0;
  const discountAmount =
    promoCodeDiscount?.discountType === "percentage"
      ? (basePrice * promoCodeDiscount.discountValue) / 100
      : promoCodeDiscount?.discountType === "fixed"
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
                        <div className="relative">
                          <Input
                            id="registration-promo-code"
                            placeholder={t("promoCodePlaceholder")}
                            {...field}
                            disabled={isLoading || isCheckingPromoCode}
                            aria-invalid={
                              !!fieldState.error || !!promoCodeError
                            }
                            className="pr-28"
                          />
                          {watchPromoCode?.trim() && (
                            <Button
                              type="button"
                              size="sm"
                              variant="default"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2 cursor-pointer bg-[#48C773] text-white hover:bg-[#3fa962] shadow-sm"
                              onClick={validatePromoCodeInput}
                              disabled={isCheckingPromoCode || isLoading}
                              aria-label={tCommon("apply")}
                            >
                              {isCheckingPromoCode ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                tCommon("apply")
                              )}
                            </Button>
                          )}
                        </div>
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
                        {promoCodeError && (
                          <p className="text-sm text-destructive">
                            {promoCodeError}
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

            {/* Privacy Policy and Terms Checkboxes */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="privacy-checkbox"
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                  disabled={isLoading}
                  className="mt-0.5"
                />
                <label
                  htmlFor="privacy-checkbox"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  {t("iAccept")}{" "}
                  <button
                    type="button"
                    onClick={handlePrivacyClick}
                    className="text-[#48C773] hover:underline underline-offset-2 cursor-pointer"
                  >
                    {tFooter("privacyPolicy")}
                  </button>
                </label>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms-checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  disabled={isLoading}
                  className="mt-0.5"
                />
                <label
                  htmlFor="terms-checkbox"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  {t("iAccept")}{" "}
                  <button
                    type="button"
                    onClick={handleTermsClick}
                    className="text-[#48C773] hover:underline underline-offset-2 cursor-pointer"
                  >
                    {tFooter("termsOfService")}
                  </button>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={
                isLoading ||
                isCheckingPromoCode ||
                !acceptedPrivacy ||
                !acceptedTerms
              }
              className="w-full cursor-pointer bg-[#48C773] text-white hover:bg-[#48C773]/90 shadow-lg hover:shadow-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Privacy Policy Modal */}
        <Dialog open={isPrivacyOpen} onOpenChange={setIsPrivacyOpen}>
          <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 gap-0 [&>button]:hidden flex flex-col">
            <DialogTitle className="sr-only">
              {locale === "uk" ? "Політика конфіденційності" : "Privacy Policy"}
            </DialogTitle>
            <div className="flex flex-col h-full min-h-0">
              <div className="flex-1 overflow-y-auto p-6 min-h-0">
                <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-[#48C773] prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted">
                  <ReactMarkdown
                    components={
                      {
                        p: ({ children }) => (
                          <p className="mb-4 last:mb-0">{children}</p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-foreground">
                            {children}
                          </strong>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-3xl font-bold mb-4 mt-6 first:mt-0">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-2xl font-semibold mb-3 mt-5">
                            {children}
                          </h2>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside mb-4 space-y-2">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside mb-4 space-y-2">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-muted-foreground">{children}</li>
                        ),
                      } as Components
                    }
                  >
                    {privacyContent}
                  </ReactMarkdown>
                </div>
              </div>
              <div className="border-t p-4 flex justify-end shrink-0">
                <Button
                  onClick={() => setIsPrivacyOpen(false)}
                  className="cursor-pointer"
                >
                  {tCommon("close")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Terms of Service Modal */}
        <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
          <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 gap-0 [&>button]:hidden flex flex-col">
            <DialogTitle className="sr-only">
              {tFooter("termsOfService")}
            </DialogTitle>
            <div className="flex flex-col h-full min-h-0">
              <div className="flex-1 overflow-y-auto p-6 min-h-0">
                <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-[#48C773] prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted">
                  <ReactMarkdown
                    components={
                      {
                        p: ({ children }) => (
                          <p className="mb-4 last:mb-0">{children}</p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-foreground">
                            {children}
                          </strong>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-3xl font-bold mb-4 mt-6 first:mt-0">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-2xl font-semibold mb-3 mt-5">
                            {children}
                          </h2>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside mb-4 space-y-2">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside mb-4 space-y-2">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-muted-foreground">{children}</li>
                        ),
                      } as Components
                    }
                  >
                    {termsContent}
                  </ReactMarkdown>
                </div>
              </div>
              <div className="border-t p-4 flex justify-end shrink-0">
                <Button
                  onClick={() => setIsTermsOpen(false)}
                  className="cursor-pointer"
                >
                  {tCommon("close")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
