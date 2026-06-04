"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useShell } from "./ShellProvider";
import { SHELL_CHROME_SURFACE } from "./shell-surface";

export function ShellTopBar({ title }: { title?: string }) {
  const { setMobileOpen } = useShell();
  const t = useTranslations("shell");

  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b px-4 py-3 lg:hidden",
        SHELL_CHROME_SURFACE
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={() => setMobileOpen(true)}
        aria-label={t("openMenu")}
      >
        <Menu className="size-5" aria-hidden />
      </Button>
      {title ? (
        <h1 className="truncate text-base font-semibold text-card-foreground">
          {title}
        </h1>
      ) : null}
    </div>
  );
}
