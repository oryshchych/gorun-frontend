"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { createLoginSchema, type LoginFormData } from "@/lib/validations/auth";
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
import { AnimatedFormField } from "@/components/shared/AnimatedFormField";
import { handleApiError, showSuccessToast } from "@/lib/error-handler";
import { GoogleOAuthButton } from "@/components/auth/GoogleOAuthButton";

export function LoginForm() {
  const router = useRouter();
  const locale = useLocale();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const t = useTranslations("auth");
  const tValidation = useTranslations("validation");
  const tApiCodes = useTranslations("apiCodes");

  const form = useForm<LoginFormData>({
    resolver: zodResolver(createLoginSchema(tValidation)),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login({
        email: data.email.trim(),
        password: data.password,
        rememberMe,
      });
      showSuccessToast(
        "SUCCESS_AUTH_LOGGED_IN",
        t("loginSuccessful"),
        tApiCodes
      );
      router.push(`/${locale}/events`);
    } catch (error: unknown) {
      handleApiError(error, t("loginFailed"), tApiCodes);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <GoogleOAuthButton
        locale={locale}
        rememberMe={rememberMe}
        label={t("loginWithGoogle")}
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
          aria-label="Login form"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <AnimatedFormField error={fieldState.error?.message}>
                <FormItem>
                  <FormLabel htmlFor="login-email">{t("email")}</FormLabel>
                  <FormControl>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      disabled={isLoading}
                      autoComplete="email"
                      aria-required="true"
                      aria-invalid={!!fieldState.error}
                      aria-describedby={
                        fieldState.error ? "login-email-error" : undefined
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage id="login-email-error" />
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
                  <div className="flex items-center justify-between gap-2">
                    <FormLabel htmlFor="login-password">
                      {t("password")}
                    </FormLabel>
                    <Link
                      href={`/${locale}/forgot-password`}
                      className="text-xs font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                    >
                      {t("forgotPassword")}
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder={t("passwordPlaceholder")}
                      disabled={isLoading}
                      autoComplete="current-password"
                      aria-required="true"
                      aria-invalid={!!fieldState.error}
                      aria-describedby={
                        fieldState.error ? "login-password-error" : undefined
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage id="login-password-error" />
                </FormItem>
              </AnimatedFormField>
            )}
          />

          <div className="flex items-start gap-2">
            <Checkbox
              id="login-remember"
              checked={rememberMe}
              onChange={() => setRememberMe((v) => !v)}
              disabled={isLoading}
              aria-describedby="login-remember-hint"
            />
            <div className="grid gap-0.5 leading-none">
              <label
                htmlFor="login-remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {t("rememberMe")}
              </label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full font-bold"
            variant="outline"
            disabled={isLoading}
            aria-label={isLoading ? t("loggingIn") : t("login")}
          >
            {isLoading ? t("loggingIn") : t("login")}
          </Button>
        </form>
      </Form>
    </div>
  );
}
