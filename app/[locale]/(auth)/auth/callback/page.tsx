import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { AuthOAuthCallback } from "@/components/auth/AuthOAuthCallback";

export default async function AuthOAuthCallbackPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tCommon = await getTranslations({ locale, namespace: "common" });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="text-sm text-muted-foreground">
            {tCommon("loading")}
          </div>
        }
      >
        <AuthOAuthCallback />
      </Suspense>
    </div>
  );
}
