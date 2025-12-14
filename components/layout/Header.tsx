"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { User, LogOut, Calendar, CalendarPlus, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

export default function Header() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const tNav = useTranslations("nav");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push(`/${locale}/login`);
      setMobileMenuOpen(false);
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href={`/${locale}`}
            className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
            aria-label="Events Platform Home"
          >
            <Calendar className="h-6 w-6" aria-hidden="true" />
            <span className="font-bold text-xl hidden sm:inline">
              Events Platform
            </span>
            <span className="font-bold text-lg sm:hidden">Events</span>
          </Link>

          {isAuthenticated && (
            <nav
              className="hidden md:flex items-center gap-4"
              aria-label="Main navigation"
            >
              <Link href={`/${locale}/events`}>
                <Button variant="ghost" size="sm" aria-label="View all events">
                  {tNav("events")}
                </Button>
              </Link>
              <Link href={`/${locale}/my-events`}>
                <Button variant="ghost" size="sm" aria-label="View my events">
                  {tNav("myEvents")}
                </Button>
              </Link>
              <Link href={`/${locale}/my-registrations`}>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="View my registrations"
                >
                  {tNav("myRegistrations")}
                </Button>
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>

          {isLoading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          ) : isAuthenticated && user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hidden md:flex"
                  >
                    <User className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/${locale}/events/create`}
                      className="cursor-pointer"
                    >
                      <CalendarPlus className="mr-2 h-4 w-4" />
                      {tNav("createEvent")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/${locale}/my-events`}
                      className="cursor-pointer"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {tNav("myEvents")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {tNav("logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={
                  mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"
                }
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href={`/${locale}/login`}>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Login to your account"
                >
                  {tNav("login")}
                </Button>
              </Link>
              <Link
                href={`/${locale}/register`}
                className="hidden sm:inline-block"
              >
                <Button size="sm" aria-label="Create a new account">
                  {tNav("register")}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile navigation menu */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden border-t" id="mobile-navigation">
          <nav
            className="container py-4 flex flex-col gap-2 px-4"
            aria-label="Mobile navigation"
          >
            <Link href={`/${locale}/events`} onClick={closeMobileMenu}>
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
                aria-label="View all events"
              >
                <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                {tNav("events")}
              </Button>
            </Link>
            <Link href={`/${locale}/events/create`} onClick={closeMobileMenu}>
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
                aria-label="Create new event"
              >
                <CalendarPlus className="mr-2 h-4 w-4" aria-hidden="true" />
                {tNav("createEvent")}
              </Button>
            </Link>
            <Link href={`/${locale}/my-events`} onClick={closeMobileMenu}>
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
                aria-label="View my events"
              >
                <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                {tNav("myEvents")}
              </Button>
            </Link>
            <Link
              href={`/${locale}/my-registrations`}
              onClick={closeMobileMenu}
            >
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
                aria-label="View my registrations"
              >
                <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                {tNav("myRegistrations")}
              </Button>
            </Link>

            <div className="border-t pt-2 mt-2">
              <div className="flex flex-col gap-2 px-2 py-2">
                <div className="flex flex-col space-y-1 mb-2">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <ThemeToggle />
                  <LanguageSwitcher />
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {tNav("logout")}
                </Button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
