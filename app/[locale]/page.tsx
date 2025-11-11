import { useTranslations } from 'next-intl';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';

export default function HomePage() {
  const t = useTranslations('nav');

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Events Platform</h2>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex items-center justify-center min-h-[calc(100vh-73px)]">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{t('home')}</h1>
          <p className="text-muted-foreground">Welcome to the Events Platform</p>
        </div>
      </main>
    </div>
  );
}
