'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import { User, LogOut, Calendar, CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useLocale, useTranslations } from 'next-intl';

export default function Header() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const tNav = useTranslations('nav');

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push(`/${locale}/login`);
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <Calendar className="h-6 w-6" />
            <span className="font-bold text-xl">Events Platform</span>
          </Link>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-4">
              <Link href={`/${locale}/events`}>
                <Button variant="ghost" size="sm">
                  {tNav('events')}
                </Button>
              </Link>
              <Link href={`/${locale}/my-events`}>
                <Button variant="ghost" size="sm">
                  {tNav('myEvents')}
                </Button>
              </Link>
              <Link href={`/${locale}/my-registrations`}>
                <Button variant="ghost" size="sm">
                  {tNav('myRegistrations')}
                </Button>
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />

          {isLoading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/events/create`} className="cursor-pointer">
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    {tNav('createEvent')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/my-events`} className="cursor-pointer">
                    <Calendar className="mr-2 h-4 w-4" />
                    {tNav('myEvents')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  {tNav('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href={`/${locale}/login`}>
                <Button variant="ghost" size="sm">
                  {tNav('login')}
                </Button>
              </Link>
              <Link href={`/${locale}/register`}>
                <Button size="sm">{tNav('register')}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
