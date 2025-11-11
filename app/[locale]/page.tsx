import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('nav');

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{t('home')}</h1>
        <p className="text-gray-600">Events Platform</p>
      </div>
    </div>
  );
}
