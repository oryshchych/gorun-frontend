import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import {
  generateMetadata as generateSEOMetadata,
  generateOrganizationStructuredData,
  generateWebsiteStructuredData,
  siteConfig,
} from "@/lib/seo";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { defaultLocale } from "@/i18n";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  // Get translations for default title
  const t = await getTranslations({ locale });

  return generateSEOMetadata({
    locale,
    title: t("home.title") || siteConfig.name,
    description: undefined, // Will use default from siteConfig
  });
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  // Generate structured data for Organization and Website
  const organizationData = generateOrganizationStructuredData();
  const websiteData = generateWebsiteStructuredData();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationData),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteData),
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <NextIntlClientProvider messages={messages}>
              <AuthProvider>
                <ErrorBoundary>{children}</ErrorBoundary>
                <Toaster />
              </AuthProvider>
            </NextIntlClientProvider>
          </QueryProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
