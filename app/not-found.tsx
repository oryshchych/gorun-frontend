"use client";

import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import "./globals.css";

// Import translation files
import ukMessages from "@/messages/uk.json";
import enMessages from "@/messages/en.json";

const translations = {
  uk: ukMessages,
  en: enMessages,
};

function detectLanguage(): "uk" | "en" {
  if (typeof window === "undefined") return "uk";

  // Check URL path for locale
  const path = window.location.pathname;
  if (path.startsWith("/en")) return "en";
  if (path.startsWith("/uk")) return "uk";

  // Check browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith("uk") || browserLang.startsWith("ru")) return "uk";

  // Default to Ukrainian
  return "uk";
}

export default function RootNotFound() {
  const [locale, setLocale] = useState<"uk" | "en">("uk");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocale(detectLanguage());
    setMounted(true);
  }, []);

  const messages = translations[locale];
  const t = {
    notFound: messages.errors.notFound,
    notFoundDescription: messages.errors.notFoundDescription,
    goHome: messages.errors.goHome,
    browseEvents: messages.errors.browseEvents,
    helpfulLinks: messages.errors.helpfulLinks,
    allEvents: messages.errors.allEvents,
    myEvents: messages.errors.myEvents,
    myRegistrations: messages.errors.myRegistrations,
  };

  if (!mounted) {
    // Prevent hydration mismatch by showing loading state
    return (
      <html lang="uk">
        <body>
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang={locale}>
      <body>
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="text-center max-w-2xl mx-auto">
            {/* 404 Illustration */}
            <div className="mb-8">
              <div className="relative">
                <h1 className="text-9xl sm:text-[12rem] font-bold text-primary/10 select-none">
                  404
                </h1>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Search
                    className="w-20 h-20 sm:w-24 sm:h-24 text-muted-foreground/40"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {t.notFound}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                {t.notFoundDescription}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button asChild size="lg" className="w-full sm:w-auto group">
                <Link href={`/${locale}`}>
                  <Home className="mr-2 w-4 h-4" aria-hidden="true" />
                  {t.goHome}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto group"
              >
                <Link href={`/${locale}/events`}>
                  <ArrowLeft
                    className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform"
                    aria-hidden="true"
                  />
                  {t.browseEvents}
                </Link>
              </Button>
            </div>

            {/* Language Toggle */}
            <div className="mb-8">
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setLocale("uk")}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    locale === "uk"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Українська
                </button>
                <button
                  onClick={() => setLocale("en")}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    locale === "en"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Helpful Links */}
            <div className="pt-8 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                {t.helpfulLinks}
              </p>
              <div className="flex flex-wrap gap-4 justify-center text-sm">
                <Link
                  href={`/${locale}/events`}
                  className="text-primary hover:underline"
                >
                  {t.allEvents}
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link
                  href={`/${locale}/my-events`}
                  className="text-primary hover:underline"
                >
                  {t.myEvents}
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link
                  href={`/${locale}/my-registrations`}
                  className="text-primary hover:underline"
                >
                  {t.myRegistrations}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
