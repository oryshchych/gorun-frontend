"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { isAdminUser } from "@/lib/admin/access";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin");
  const deniedToastShown = useRef(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/${locale}/login`);
    }
  }, [isAuthenticated, isLoading, locale, router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !isAdminUser(user)) {
      if (!deniedToastShown.current) {
        deniedToastShown.current = true;
        toast.error(t("accessDenied"));
      }
      router.replace(`/${locale}/events`);
    }
  }, [isAuthenticated, isLoading, locale, router, t, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  if (!isAuthenticated || !user || !isAdminUser(user)) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />
      <div
        id="main-content"
        className="min-w-0 flex-1 overflow-auto"
        role="main"
      >
        {children}
      </div>
    </div>
  );
}
