'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  const t = useTranslations('errors');
  const locale = useLocale();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-background to-muted/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto"
      >
        {/* 404 Illustration */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative">
            <h1 className="text-9xl sm:text-[12rem] font-bold text-primary/10 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-20 h-20 sm:w-24 sm:h-24 text-muted-foreground/40" aria-hidden="true" />
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t('notFound')}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            {t('notFoundDescription')}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button asChild size="lg" className="w-full sm:w-auto group">
            <Link href={`/${locale}`}>
              <Home className="mr-2 w-4 h-4" aria-hidden="true" />
              {t('goHome')}
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full sm:w-auto group"
          >
            <Link href={`/${locale}/events`}>
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
              {t('browseEvents')}
            </Link>
          </Button>
        </motion.div>

        {/* Helpful Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-12 pt-8 border-t"
        >
          <p className="text-sm text-muted-foreground mb-4">
            {t('helpfulLinks')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link
              href={`/${locale}/events`}
              className="text-primary hover:underline"
            >
              {t('allEvents')}
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href={`/${locale}/my-events`}
              className="text-primary hover:underline"
            >
              {t('myEvents')}
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href={`/${locale}/my-registrations`}
              className="text-primary hover:underline"
            >
              {t('myRegistrations')}
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
