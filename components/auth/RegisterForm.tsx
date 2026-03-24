"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useAuth } from "@/hooks/useAuth";
import {
  createRegisterSchema,
  type RegisterFormData,
} from "@/lib/validations/auth";
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
import { GoogleOAuthButton } from "@/components/auth/GoogleOAuthButton";

export function RegisterForm() {
  const router = useRouter();
  const locale = useLocale();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("auth");
  const tValidation = useTranslations("validation");
  const tApiCodes = useTranslations("apiCodes");

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(createRegisterSchema(tValidation)),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await register({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone,
        email: data.email.trim(),
        password: data.password,
      });
      showSuccessToast(
        "SUCCESS_AUTH_REGISTERED",
        t("registrationSuccessful"),
        tApiCodes
      );
      router.push(`/${locale}/events`);
    } catch (error: unknown) {
      handleApiError(error, t("registrationFailed"), tApiCodes);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <GoogleOAuthButton
        locale={locale}
        label={t("registerWithGoogle")}
        disabled={isLoading}
      />
      <div className="flex flex-col items-center gap-4">
        <div className="border-t w-full" />
        <span className="text-xs uppercase text-muted-foreground">
          {t("orContinueWith")}
        </span>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          aria-label="Registration form"
        >
          <FormField
            control={form.control}
            name="firstName"
            render={({ field, fieldState }) => (
              <AnimatedFormField error={fieldState.error?.message}>
                <FormItem>
                  <FormLabel htmlFor="register-first-name">
                    {t("firstName")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="register-first-name"
                      type="text"
                      placeholder={t("firstNamePlaceholder")}
                      disabled={isLoading}
                      autoComplete="given-name"
                      aria-required="true"
                      aria-invalid={!!fieldState.error}
                      aria-describedby={
                        fieldState.error
                          ? "register-first-name-error"
                          : undefined
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage id="register-first-name-error" />
                </FormItem>
              </AnimatedFormField>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field, fieldState }) => (
              <AnimatedFormField error={fieldState.error?.message}>
                <FormItem>
                  <FormLabel htmlFor="register-last-name">
                    {t("lastName")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="register-last-name"
                      type="text"
                      placeholder={t("lastNamePlaceholder")}
                      disabled={isLoading}
                      autoComplete="family-name"
                      aria-required="true"
                      aria-invalid={!!fieldState.error}
                      aria-describedby={
                        fieldState.error
                          ? "register-last-name-error"
                          : undefined
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage id="register-last-name-error" />
                </FormItem>
              </AnimatedFormField>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field, fieldState }) => (
              <AnimatedFormField error={fieldState.error?.message}>
                <FormItem>
                  <FormLabel htmlFor="register-phone">{t("phone")}</FormLabel>
                  <FormControl>
                    <PhoneInput
                      id="register-phone"
                      international
                      defaultCountry="UA"
                      placeholder={t("phonePlaceholder")}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                      className={fieldState.error ? "phone-error" : ""}
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
            name="email"
            render={({ field, fieldState }) => (
              <AnimatedFormField error={fieldState.error?.message}>
                <FormItem>
                  <FormLabel htmlFor="register-email">{t("email")}</FormLabel>
                  <FormControl>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      disabled={isLoading}
                      autoComplete="email"
                      aria-required="true"
                      aria-invalid={!!fieldState.error}
                      aria-describedby={
                        fieldState.error ? "register-email-error" : undefined
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage id="register-email-error" />
                </FormItem>
              </AnimatedFormField>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <AnimatedFormField error={fieldState.error?.message}>
                <FormItem>
                  <FormLabel htmlFor="register-password">
                    {t("password")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder={t("passwordPlaceholder")}
                      disabled={isLoading}
                      autoComplete="new-password"
                      aria-required="true"
                      aria-invalid={!!fieldState.error}
                      aria-describedby={
                        fieldState.error ? "register-password-error" : undefined
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage id="register-password-error" />
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
                  <FormLabel htmlFor="register-confirm-password">
                    {t("confirmPassword")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder={t("passwordPlaceholder")}
                      disabled={isLoading}
                      autoComplete="new-password"
                      aria-required="true"
                      aria-invalid={!!fieldState.error}
                      aria-describedby={
                        fieldState.error
                          ? "register-confirm-password-error"
                          : undefined
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage id="register-confirm-password-error" />
                </FormItem>
              </AnimatedFormField>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            variant="outline"
            disabled={isLoading}
            aria-label={isLoading ? t("creatingAccount") : t("createAccount")}
          >
            {isLoading ? t("creatingAccount") : t("createAccount")}
          </Button>
        </form>
      </Form>
    </div>
  );
}
