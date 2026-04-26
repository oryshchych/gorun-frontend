import type { Locale } from "@/i18n";

export const legalDocumentSlugs = [
  "privacy-policy",
  "terms-of-service",
] as const;

export type LegalDocumentSlug = (typeof legalDocumentSlugs)[number];

export const legalDocuments: Record<
  LegalDocumentSlug,
  {
    title: Record<Locale, string>;
    description: Record<Locale, string>;
  }
> = {
  "privacy-policy": {
    title: {
      uk: "Політика конфіденційності",
      en: "Privacy Policy",
    },
    description: {
      uk: "Політика конфіденційності GoRun щодо обробки та захисту персональних даних.",
      en: "GoRun Privacy Policy for personal data processing and protection.",
    },
  },
  "terms-of-service": {
    title: {
      uk: "Умови використання",
      en: "Terms of Service",
    },
    description: {
      uk: "Умови використання сервісу GoRun та участі у спортивних подіях.",
      en: "Terms of Service for using GoRun and participating in sports events.",
    },
  },
};

export function isLegalDocumentSlug(
  value: string
): value is LegalDocumentSlug {
  return legalDocumentSlugs.includes(value as LegalDocumentSlug);
}

export function getLegalDocumentPublicPath({
  locale,
  document,
}: {
  locale: Locale;
  document: LegalDocumentSlug;
}) {
  return `/content/${document}-${locale}.md`;
}
