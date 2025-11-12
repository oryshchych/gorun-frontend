'use client';

import { Event } from '@/types/event';
import { EventCard } from './EventCard';
import { EventCardSkeleton } from '@/components/shared/EventCardSkeleton';
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
          <EventCardSkeleton key={i} />
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {events.map((event) => (
        <motion.div key={event.id} variants={itemVariants}>
          <EventCard event={event} />
        </motion.div>
      ))}
    </motion.div>
  );
}
