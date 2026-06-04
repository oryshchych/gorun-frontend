import { readFile } from "fs/promises";
import path from "path";
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

export function isLegalDocumentSlug(value: string): value is LegalDocumentSlug {
  return legalDocumentSlugs.includes(value as LegalDocumentSlug);
}

const legalDocumentContentPaths: Record<
  LegalDocumentSlug,
  Record<Locale, string>
> = {
  "privacy-policy": {
    uk: path.join(process.cwd(), "content/privacy-policy-uk.md"),
    en: path.join(process.cwd(), "content/privacy-policy-en.md"),
  },
  "terms-of-service": {
    uk: path.join(process.cwd(), "content/terms-of-service-uk.md"),
    en: path.join(process.cwd(), "content/terms-of-service-en.md"),
  },
};

export async function getLegalDocumentContent({
  locale,
  document,
}: {
  locale: Locale;
  document: LegalDocumentSlug;
}) {
  try {
    return await readFile(legalDocumentContentPaths[document][locale], "utf8");
  } catch (error) {
    console.error(`Failed to load legal content: ${document}-${locale}`, error);
    return null;
  }
}
