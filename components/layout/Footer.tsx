"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Phone, Mail, Instagram, Facebook } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { agreements } from "@/content/agreements";

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations("common");
  const tFooter = useTranslations("footer");
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [privacyContent, setPrivacyContent] = useState<string>("");
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [termsContent, setTermsContent] = useState<string>("");
  const currentYear = new Date().getFullYear();

  // Contact information - these should be moved to environment variables or config
  const contactInfo = {
    phone: "",
    email: "gorunteam.ua@gmail.com",
    instagram: "https://instagram.com/gorun.lviv",
    facebook: "https://facebook.com/profile.php?id=61584661056098",
  };

  const loadMarkdownContent = async (
    filePath: string,
    errorMessageUk: string,
    errorMessageEn: string
  ): Promise<string> => {
    try {
      const response = await fetch(filePath, {
        headers: {
          Accept: "text/plain",
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      const text = await response.text();
      // Check if we got HTML instead of markdown
      if (
        text.trim().startsWith("<!DOCTYPE") ||
        text.trim().startsWith("<html")
      ) {
        throw new Error("Received HTML instead of markdown");
      }
      return text;
    } catch (error) {
      console.error("Failed to load markdown:", error);
      return locale === "uk" ? errorMessageUk : errorMessageEn;
    }
  };

  const handlePrivacyClick = async () => {
    if (!privacyContent) {
      // const content = await loadMarkdownContent(
      //   "/content/privacy-policy-uk.md",
      //   "Контент політики конфіденційності не вдалося завантажити.",
      //   "Privacy policy content could not be loaded."
      // );
      const content = agreements.privacyPolicy;
      setPrivacyContent(content);
    }
    setIsPrivacyOpen(true);
  };

  const handleTermsClick = async () => {
    if (!termsContent) {
      // const content = await loadMarkdownContent(
      //   "/content/terms-of-service-uk.md",
      //   "Контент умов використання не вдалося завантажити.",
      //   "Terms of service content could not be loaded."
      // );
      const content = agreements.termsOfService;
      setTermsContent(content);
    }
    setIsTermsOpen(true);
  };

  return (
    <footer className="border-t bg-background" role="contentinfo">
      <div className="container mx-auto py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Contact Information */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Phone */}
            {/* <a
              href={`tel:${contactInfo.phone}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
              aria-label={`Call us at ${contactInfo.phone}`}
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span>{contactInfo.phone}</span>
            </a> */}

            {/* Email */}
            <a
              href={`mailto:${contactInfo.email}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
              aria-label={`Email us at ${contactInfo.email}`}
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              <span>{contactInfo.email}</span>
            </a>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3">
              {/* Instagram */}
              <a
                href={contactInfo.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md p-1"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" aria-hidden="true" />
              </a>

              {/* Facebook */}
              <a
                href={contactInfo.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md p-1"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-5 h-5" aria-hidden="true" />
              </a>
            </div>
          </div>
          {/* Copyright and Links */}
          <div className="flex items-center md:items-end gap-4">
            <button
              onClick={handlePrivacyClick}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md cursor-pointer"
            >
              {tFooter("privacyPolicy")}
            </button>
            <button
              onClick={handleTermsClick}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md cursor-pointer"
            >
              {tFooter("termsOfService")}
            </button>
          </div>
        </div>
        <p
          className="text-sm text-muted-foreground text-center"
          suppressHydrationWarning
        >
          © {currentYear} GoRun
        </p>
      </div>

      {/* Privacy Policy Modal */}
      <Dialog open={isPrivacyOpen} onOpenChange={setIsPrivacyOpen}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 gap-0 [&>button]:hidden flex flex-col">
          <DialogTitle className="sr-only">
            {locale === "uk" ? "Політика конфіденційності" : "Privacy Policy"}
          </DialogTitle>
          <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-[#48C773] prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted">
                <ReactMarkdown
                  components={
                    {
                      p: ({ children }) => (
                        <p className="mb-4 last:mb-0">{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">
                          {children}
                        </strong>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-3xl font-bold mb-4 mt-6 first:mt-0">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-2xl font-semibold mb-3 mt-5">
                          {children}
                        </h2>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-4 space-y-2">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-4 space-y-2">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-muted-foreground">{children}</li>
                      ),
                    } as Components
                  }
                >
                  {privacyContent}
                </ReactMarkdown>
              </div>
            </div>
            <div className="border-t p-4 flex justify-end shrink-0">
              <Button
                onClick={() => setIsPrivacyOpen(false)}
                className="cursor-pointer"
              >
                {t("close")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms of Service Modal */}
      <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 gap-0 [&>button]:hidden flex flex-col">
          <DialogTitle className="sr-only">
            {tFooter("termsOfService")}
          </DialogTitle>
          <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-[#48C773] prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted">
                <ReactMarkdown
                  components={
                    {
                      p: ({ children }) => (
                        <p className="mb-4 last:mb-0">{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">
                          {children}
                        </strong>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-3xl font-bold mb-4 mt-6 first:mt-0">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-2xl font-semibold mb-3 mt-5">
                          {children}
                        </h2>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-4 space-y-2">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-4 space-y-2">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-muted-foreground">{children}</li>
                      ),
                    } as Components
                  }
                >
                  {termsContent}
                </ReactMarkdown>
              </div>
            </div>
            <div className="border-t p-4 flex justify-end shrink-0">
              <Button
                onClick={() => setIsTermsOpen(false)}
                className="cursor-pointer"
              >
                {t("close")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
