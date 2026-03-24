"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import Image from "next/image";
import { Instagram, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getUserDisplayName } from "@/lib/get-user-display-name";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  const instagramUrl = "https://instagram.com/gorun.lviv";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href={`/${locale}`}
            className="flex items-center space-x-2 focus:outline-none"
            aria-label="GoRun Events Platform Home"
          >
            <Image
              src="/images/logos/logo.png"
              alt="GoRun Events Platform"
              width={60}
              height={20}
              style={{ height: "auto" }}
              priority
            />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Instagram */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md p-1"
            aria-label="Follow us on Instagram"
          >
            <Instagram className="w-5 h-5" aria-hidden="true" />
          </a>
          <LanguageSwitcher />
          <ThemeToggle />
          {/* Auth: Login / Register or User menu */}
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon-lg"
                      className="rounded-full"
                      aria-label={t("profile")}
                    >
                      <User className="size-5" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <span className="truncate block">
                        {getUserDisplayName(user)}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => logout()}
                      className="cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                      {t("logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    href={`/${locale}/login`}
                    className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
                  >
                    {t("login")}
                  </Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
