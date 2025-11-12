'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Calendar } from 'lucide-react';

export default function Footer() {
  const locale = useLocale();
  const tNav = useTranslations('nav');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand section */}
          <div className="flex flex-col gap-4">
            <Link href={`/${locale}`} className="flex items-center space-x-2">
              <Calendar className="h-6 w-6" />
              <span className="font-bold text-xl">Events Platform</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {locale === 'uk' 
                ? 'Платформа для створення та управління подіями'
                : 'Platform for creating and managing events'}
            </p>
          </div>

          {/* Navigation links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold">
              {locale === 'uk' ? 'Навігація' : 'Navigation'}
            </h3>
            <nav className="flex flex-col gap-2 text-sm">
              <Link 
                href={`/${locale}/events`} 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {tNav('events')}
              </Link>
              <Link 
                href={`/${locale}/my-events`} 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {tNav('myEvents')}
              </Link>
              <Link 
                href={`/${locale}/my-registrations`} 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {tNav('myRegistrations')}
              </Link>
            </nav>
          </div>

          {/* Additional info */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold">
              {locale === 'uk' ? 'Інформація' : 'Information'}
            </h3>
            <div className="text-sm text-muted-foreground">
              <p>
                {locale === 'uk' 
                  ? 'Створюйте події, керуйте реєстраціями та взаємодійте з учасниками.'
                  : 'Create events, manage registrations, and engage with attendees.'}
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} Events Platform. {locale === 'uk' ? 'Всі права захищені.' : 'All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
