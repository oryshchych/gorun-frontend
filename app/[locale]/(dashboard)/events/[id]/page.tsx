'use client';

import { useEvent } from '@/hooks/useEvents';
import { EventDetails } from '@/components/events/EventDetails';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { use } from 'react';

interface EventDetailsPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default function EventDetailsPage({ params }: EventDetailsPageProps) {
  const t = useTranslations('common');
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const { data: event, isLoading, error } = useEvent(id);

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('back')}
        </Button>
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error?.message || 'Event not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button variant="ghost" onClick={handleBack} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('back')}
      </Button>

      <EventDetails event={event} />
    </div>
  );
}
