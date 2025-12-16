"use client";

import { useEvents } from "@/hooks/useEvents";
import { EventList } from "@/components/events/EventList";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function EventsPage() {
  const t = useTranslations("events");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useEvents({
    page,
    limit: 12,
    lang: locale,
  });

  const handleCreateEvent = () => {
    router.push(`/${locale}/events/create`);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">
            {t("title")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Discover and register for upcoming events
          </p>
        </div>
        <Button
          onClick={handleCreateEvent}
          className="w-full sm:w-auto shrink-0"
          aria-label="Create a new event"
        >
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          {tNav("createEvent")}
        </Button>
      </div>

      {error && (
        <div
          className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6"
          role="alert"
          aria-live="assertive"
        >
          {error.message || "Failed to load events"}
        </div>
      )}

      <EventList events={data?.data || []} isLoading={isLoading} />

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <nav
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2 mt-8"
          aria-label="Pagination navigation"
        >
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            aria-label="Go to previous page"
            className="w-full sm:w-auto"
          >
            Previous
          </Button>
          <span
            className="text-sm text-muted-foreground px-2"
            aria-current="page"
            aria-label={`Page ${page} of ${data.pagination.totalPages}`}
          >
            Page {page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() =>
              setPage((p) => Math.min(data.pagination.totalPages, p + 1))
            }
            disabled={page === data.pagination.totalPages || isLoading}
            aria-label="Go to next page"
            className="w-full sm:w-auto"
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  );
}
