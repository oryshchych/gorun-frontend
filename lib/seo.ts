import { Metadata } from "next";
import { locales, defaultLocale } from "@/i18n";

export const siteConfig = {
  name: "GoRun",
  description: {
    uk: "Платформа для реєстрації та управління біговими подіями. Зареєструйтеся на бігові події, сплачуйте онлайн та отримуйте підтвердження.",
    en: "Running events registration and management platform. Register for running events, pay online and get confirmation.",
  },
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://gorun.team",
  ogImage: "/images/logos/logo.png",
  twitterHandle: "@gorun",
};

export function generateMetadata({
  locale,
  title,
  description,
  image,
  path = "",
  noIndex = false,
}: {
  locale: string;
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const siteUrl = siteConfig.url;
  const pageUrl = `${siteUrl}/${locale}${path}`;
  const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const pageDescription =
    description ||
    siteConfig.description[locale as keyof typeof siteConfig.description] ||
    siteConfig.description.uk;
  const pageImage = image
    ? image.startsWith("http")
      ? image
      : `${siteUrl}${image}`
    : `${siteUrl}${siteConfig.ogImage}`;

  const metadata: Metadata = {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: pageUrl,
      languages: {
        "uk-UA": `${siteUrl}/uk${path}`,
        "en-US": `${siteUrl}/en${path}`,
        "x-default": `${siteUrl}/${defaultLocale}${path}`,
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "uk" ? "uk_UA" : "en_US",
      url: pageUrl,
      title: pageTitle,
      description: pageDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
      creator: siteConfig.twitterHandle,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };

  return metadata;
}

export function generateEventStructuredData(event: {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  imageUrl?: { portrait?: string; landscape?: string };
  basePrice?: number;
  capacity?: number;
  registeredCount?: number;
  locale: string;
  url: string;
}) {
  const image =
    event.imageUrl?.landscape ||
    event.imageUrl?.portrait ||
    `${siteConfig.url}${siteConfig.ogImage}`;
  const fullImageUrl = image.startsWith("http")
    ? image
    : `${siteConfig.url}${image}`;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description || "",
    startDate: event.date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: event.location
      ? {
          "@type": "Place",
          name: event.location,
        }
      : undefined,
    image: fullImageUrl,
    organizer: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    offers: event.basePrice
      ? {
          "@type": "Offer",
          url: event.url,
          price: event.basePrice,
          priceCurrency: "UAH",
          availability:
            event.capacity && event.registeredCount
              ? event.registeredCount < event.capacity
                ? "https://schema.org/InStock"
                : "https://schema.org/SoldOut"
              : "https://schema.org/InStock",
        }
      : undefined,
  };
}

export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}${siteConfig.ogImage}`,
    sameAs: [],
  };
}

export function generateWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
