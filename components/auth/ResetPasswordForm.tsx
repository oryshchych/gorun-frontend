"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  createResetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/validations/auth";
import { resetPassword } from "@/lib/api/auth";
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
import { handleApiError, showSuccessToast } from "@/lib/error-handler";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("auth");
  const tValidation = useTranslations("validation");
  const tApiCodes = useTranslations("apiCodes");

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(createResetPasswordSchema(tValidation)),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      await resetPassword({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      showSuccessToast(
        "SUCCESS_AUTH_PASSWORD_RESET",
        t("resetPasswordSuccess"),
        tApiCodes
      );
      router.push(`/${locale}/login`);
    } catch (error: unknown) {
      handleApiError(error, t("resetPasswordFailed"), tApiCodes);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        aria-label={t("resetPasswordFormAria")}
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <AnimatedFormField error={fieldState.error?.message}>
              <FormItem>
                <FormLabel htmlFor="reset-password">{t("password")}</FormLabel>
                <FormControl>
                  <Input
                    id="reset-password"
                    type="password"
                    placeholder={t("passwordPlaceholder")}
                    disabled={isLoading}
                    autoComplete="new-password"
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
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <AnimatedFormField error={fieldState.error?.message}>
              <FormItem>
                <FormLabel htmlFor="reset-confirm-password">
                  {t("confirmPassword")}
                </FormLabel>
                <FormControl>
                  <Input
                    id="reset-confirm-password"
                    type="password"
                    placeholder={t("passwordPlaceholder")}
                    disabled={isLoading}
                    autoComplete="new-password"
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
          {isLoading ? t("updatingPassword") : t("resetPasswordSubmit")}
        </Button>
      </form>
    </Form>
  );
}
