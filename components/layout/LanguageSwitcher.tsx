"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { locales } from "@/i18n";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLocaleChange = (newLocale: string) => {
    // Remove locale prefix if it exists in pathname
    let pathWithoutLocale = pathname;

    // Check if pathname starts with any locale and remove it
    for (const loc of locales) {
      if (pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)) {
        pathWithoutLocale = pathname.slice(`/${loc}`.length);
        break;
      }
    }

    // Ensure path starts with / (handle root path case)
    const normalizedPath =
      pathWithoutLocale === "" || pathWithoutLocale === "/"
        ? "/"
        : pathWithoutLocale.startsWith("/")
          ? pathWithoutLocale
          : `/${pathWithoutLocale}`;

    // Preserve search params if any
    const search = searchParams.toString();
    const queryString = search ? `?${search}` : "";

    // Navigate to the same path with the new locale
    router.push(`/${newLocale}${normalizedPath}${queryString}`);
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
