import { LegalMarkdown } from "@/components/legal/LegalMarkdown";
import { locales, type Locale } from "@/i18n";
import {
  getLegalDocumentContent,
  isLegalDocumentSlug,
  legalDocumentSlugs,
  legalDocuments,
} from "@/lib/legal-content";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export function generateStaticParams() {
  return legalDocumentSlugs.map((document) => ({ document }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; document: string }>;
}): Promise<Metadata> {
  const { locale, document } = await params;

  if (
    !locales.includes(locale as Locale) ||
    !isLegalDocumentSlug(document)
  ) {
    return {};
  }

  const typedLocale = locale as Locale;
  const metadata = legalDocuments[document];

  return generateSEOMetadata({
    locale: typedLocale,
    title: metadata.title[typedLocale],
    description: metadata.description[typedLocale],
    path: `/${document}`,
  });
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string; document: string }>;
}) {
  const { locale, document } = await params;

  if (
    !locales.includes(locale as Locale) ||
    !isLegalDocumentSlug(document)
  ) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const content = await getLegalDocumentContent({
    locale: typedLocale,
    document,
  });

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 md:py-12">
      <article className="mx-auto max-w-4xl">
        <LegalMarkdown content={content} />
      </article>
    </div>
  );
}
