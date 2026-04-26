"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { handleApiError } from "@/lib/error-handler";

export function AuthOAuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const { exchangeOAuthCallback } = useAuth();
  const t = useTranslations("auth");
  const tApiCodes = useTranslations("apiCodes");
  const code = searchParams.get("code");
  const [exchangeError, setExchangeError] = useState<{
    code: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!code) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await exchangeOAuthCallback(code);
        if (!cancelled) {
          router.replace(`/${locale}`);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = t("oauthFailed");
          handleApiError(err, message, tApiCodes);
          setExchangeError({ code, message });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, exchangeOAuthCallback, router, locale, t, tApiCodes]);

  const error = !code
    ? t("oauthMissingCode")
    : exchangeError?.code === code
      ? exchangeError.message
      : null;

  if (error) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <button
          type="button"
          className="text-sm text-primary underline"
          onClick={() => router.push(`/${locale}/login`)}
        >
          {t("backToLogin")}
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
      <span className="text-sm">{t("oauthCompleting")}</span>
    </div>
  );
}
