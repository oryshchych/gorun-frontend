"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { locales } from "@/i18n";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    // Get the current pathname without the locale prefix
    const pathWithoutLocale = pathname.replace(`/${locale}`, "");

    // Navigate to the same path with the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <div className="flex items-center gap-2">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleLocaleChange(loc)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            locale === loc
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
          aria-label={`Switch to ${loc === "uk" ? "Ukrainian" : "English"}`}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
