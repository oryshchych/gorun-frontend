'use client';

import { Event } from '@/types/event';
import { EventCard } from './EventCard';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

interface EventListProps {
  events: Event[];
  isLoading?: boolean;
}

export function EventList({ events, isLoading = false }: EventListProps) {
  const t = useTranslations('events');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-[400px] rounded-lg bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-lg">{t('noEvents')}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <EventCard event={event} />
        </motion.div>
      ))}
    </motion.div>
  );
}
