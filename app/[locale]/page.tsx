"use client";

import { useTranslations, useLocale } from "next-intl";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Sparkles, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEvents } from "@/hooks/useEvents";
import { EventList } from "@/components/events/EventList";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const { isAuthenticated } = useAuth();

  // Fetch featured events (first 6 upcoming events)
  const { data: eventsData, isLoading } = useEvents({ limit: 6 });
  const featuredEvents = eventsData?.data || [];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href={`/${locale}`}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <Image
              src="/images/logos/logo.png"
              alt="GoRun Events Platform"
              width={60}
              height={20}
              priority
            />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            {isAuthenticated ? (
              <Button asChild variant="default" className="ml-2">
                <Link href={`/${locale}/events`}>{t("nav.events")}</Link>
              </Button>
            ) : (
              <Button asChild variant="default" className="ml-2">
                <Link href={`/${locale}/login`}>{t("nav.login")}</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="container mx-auto px-4 py-16 sm:py-24 lg:py-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>{t("home.badge")}</span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
              >
                {t("home.title")}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
              >
                {t("home.subtitle")}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                {isAuthenticated ? (
                  <>
                    <Button
                      asChild
                      size="lg"
                      className="w-full sm:w-auto group"
                    >
                      <Link href={`/${locale}/events`}>
                        {t("home.browseEvents")}
                        <ArrowRight
                          className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                          aria-hidden="true"
                        />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <Link href={`/${locale}/events/create`}>
                        <Calendar className="mr-2 w-4 h-4" aria-hidden="true" />
                        {t("home.createEvent")}
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      size="lg"
                      className="w-full sm:w-auto group"
                    >
                      <Link href={`/${locale}/register`}>
                        {t("home.getStarted")}
                        <ArrowRight
                          className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                          aria-hidden="true"
                        />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <Link href={`/${locale}/login`}>{t("nav.login")}</Link>
                    </Button>
                  </>
                )}
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="mt-16 grid grid-cols-2 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
              >
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                    {featuredEvents.length}+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("home.activeEvents")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                    <Users className="w-8 h-8 mx-auto" aria-hidden="true" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("home.community")}
                  </div>
                </div>
                <div className="text-center col-span-2 sm:col-span-1">
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                    24/7
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("home.availability")}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Featured Events Section */}
        {featuredEvents.length > 0 && (
          <section className="py-16 sm:py-24">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  {t("home.featuredEvents")}
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {t("home.featuredEventsSubtitle")}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <EventList events={featuredEvents} isLoading={isLoading} />
              </motion.div>

              {featuredEvents.length >= 6 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-center mt-12"
                >
                  <Button asChild size="lg" variant="outline" className="group">
                    <Link href={`/${locale}/events`}>
                      {t("home.viewAllEvents")}
                      <ArrowRight
                        className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                        aria-hidden="true"
                      />
                    </Link>
                  </Button>
                </motion.div>
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
