"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import Image from "next/image";
import { Phone, Mail, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  // Contact information - these should be moved to environment variables or config
  const contactInfo = {
    phone: "+380501234567",
    email: "gorunteam.ua@gmail.com",
    instagram: "https://instagram.com/gorun.lviv",
    facebook: "https://facebook.com/profile.php?id=61584661056098",
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
          {/* Copyright */}
          <p className="text-sm text-muted-foreground" suppressHydrationWarning>
            © {currentYear} GoRun Events Platform.{" "}
            {locale === "uk" ? "Всі права захищені." : "All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  );
}
