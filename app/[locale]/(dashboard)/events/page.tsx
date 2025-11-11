'use client';

import { useEvents } from '@/hooks/useEvents';
import { EventList } from '@/components/events/EventList';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function EventsPage() {
  const t = useTranslations('events');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useEvents({ page, limit: 12 });

  const handleCreateEvent = () => {
    router.push(`/${locale}/events/create`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">
            Discover and register for upcoming events
          </p>
        </div>
        <Button onClick={handleCreateEvent}>
          <Plus className="w-4 h-4 mr-2" />
          {tNav('createEvent')}
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6">
          {error.message || 'Failed to load events'}
        </div>
      )}

      <EventList events={data?.data || []} isLoading={isLoading} />

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
            disabled={page === data.pagination.totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
