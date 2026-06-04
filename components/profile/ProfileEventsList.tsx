"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMyRegistrations } from "@/hooks/useRegistrations";
import { EventCard } from "@/components/events/EventCard";
import { ShellPageHeader } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  isPastRegistration,
  isUpcomingRegistration,
  startOfTodayLocal,
} from "@/lib/profile-registrations";

type Variant = "upcoming" | "past";

export function ProfileEventsList({ variant }: { variant: Variant }) {
  const t = useTranslations("profile");
  const tErrors = useTranslations("errors");
  const locale = useLocale();
  const todayStart = useMemo(() => startOfTodayLocal(), []);

  const { data, isLoading, error } = useMyRegistrations({
    page: 1,
    limit: 100,
  });

  const filtered = useMemo(() => {
    const rows = data?.data ?? [];
    return rows.filter((r) => {
      if (!r.event) return false;
      return variant === "upcoming"
        ? isUpcomingRegistration(r, todayStart)
        : isPastRegistration(r, todayStart);
    });
  }, [data?.data, todayStart, variant]);

  const title =
    variant === "upcoming" ? t("myEventsTitle") : t("pastEventsTitle");
  const subtitle =
    variant === "upcoming" ? t("myEventsSubtitle") : t("pastEventsSubtitle");

  if (isLoading) {
    return (
      <div>
        <ShellPageHeader
          title={title}
          description={subtitle}
          className="mb-8"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-[400px] rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <ShellPageHeader
          title={title}
          description={subtitle}
          className="mb-8"
        />
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error.message || tErrors("unexpectedError")}
        </div>
      </div>
    );
  }

  return (
    <div>
      <ShellPageHeader title={title} description={subtitle} className="mb-8" />

      {filtered.length === 0 ? (
        <div className="shell-surface flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center px-4">
          <p className="text-lg mb-2 shell-ink-muted">
            {variant === "upcoming" ? t("noUpcoming") : t("noPast")}
          </p>
          <p className="text-sm shell-ink-muted mb-6 max-w-md">
            {variant === "upcoming" ? t("noUpcomingHint") : t("noPastHint")}
          </p>
          <Button asChild>
            <Link href={`/${locale}/events`}>{t("browseEvents")}</Link>
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {filtered.map((registration, index) => (
            <motion.div
              key={registration.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
            >
              <EventCard event={registration.event!} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
