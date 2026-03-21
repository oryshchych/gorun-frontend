"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  createForgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validations/auth";
import { forgotPassword } from "@/lib/api/auth";
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
import { handleApiError } from "@/lib/error-handler";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const t = useTranslations("auth");
  const tValidation = useTranslations("validation");
  const tApiCodes = useTranslations("apiCodes");

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(createForgotPasswordSchema(tValidation)),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await forgotPassword({ email: data.email });
      setSubmitted(true);
    } catch (error: unknown) {
      handleApiError(error, t("forgotPasswordFailed"), tApiCodes);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <p className="text-sm text-muted-foreground text-center" role="status">
        {t("forgotPasswordEmailSent")}
      </p>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        aria-label={t("forgotPasswordFormAria")}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <AnimatedFormField error={fieldState.error?.message}>
              <FormItem>
                <FormLabel htmlFor="forgot-email">{t("email")}</FormLabel>
                <FormControl>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    disabled={isLoading}
                    autoComplete="email"
                    aria-required="true"
                    aria-invalid={!!fieldState.error}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </AnimatedFormField>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t("sending") : t("sendResetLink")}
        </Button>
      </form>
    </Form>
  );
}
