import { locales, type Locale } from "@/i18n";
import {
  getLegalDocumentContent,
  isLegalDocumentSlug,
} from "@/lib/legal-content";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; document: string }> }
) {
  const { locale, document } = await params;

  if (!locales.includes(locale as Locale) || !isLegalDocumentSlug(document)) {
    return new NextResponse(null, { status: 404 });
  }

  const content = await getLegalDocumentContent({
    locale: locale as Locale,
    document,
  });

  if (!content) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
