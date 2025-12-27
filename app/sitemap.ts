import { MetadataRoute } from "next";
import { locales, defaultLocale } from "@/i18n";
import { siteConfig } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const currentDate = new Date().toISOString();

  // Base pages for each locale
  const routes = ["", "/events", "/login", "/register"];

  // Generate sitemap entries for each locale
  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of routes) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: currentDate,
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1.0 : route === "/events" ? 0.9 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((loc) => [
              loc === "uk" ? "uk-UA" : "en-US",
              `${baseUrl}/${loc}${route}`,
            ])
          ),
        },
      });
    }
  }

  // Add default locale redirects
  for (const route of routes) {
    if (route !== "") {
      sitemapEntries.push({
        url: `${baseUrl}${route}`,
        lastModified: currentDate,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  return sitemapEntries;
}
