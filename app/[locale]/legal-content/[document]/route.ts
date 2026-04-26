import { locales, type Locale } from "@/i18n";
import {
  getLegalDocumentPublicPath,
  isLegalDocumentSlug,
} from "@/lib/legal-content";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string; document: string }> }
) {
  const { locale, document } = await params;

  if (
    !locales.includes(locale as Locale) ||
    !isLegalDocumentSlug(document)
  ) {
    return new NextResponse(null, { status: 404 });
  }

  const contentPath = getLegalDocumentPublicPath({
    locale: locale as Locale,
    document,
  });
  const contentResponse = await fetch(new URL(contentPath, request.url), {
    headers: {
      Accept: "text/plain",
    },
  });

  if (!contentResponse.ok) {
    return new NextResponse(null, { status: 404 });
  }

  const content = await contentResponse.text();

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
