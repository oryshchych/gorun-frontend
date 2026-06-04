"use client";

import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useShell } from "./ShellProvider";
import { ShellNav } from "./ShellNav";
import { SHELL_CHROME_SURFACE } from "./shell-surface";
import type { ShellFooterLink, ShellNavItem } from "./types";

export function ShellMobileDrawer({
  basePath,
  items,
  footer,
  ariaLabel,
}: {
  basePath: string;
  items: ShellNavItem[];
  footer?: ShellFooterLink;
  ariaLabel: string;
}) {
  const { mobileOpen, setMobileOpen } = useShell();
  const t = useTranslations("shell");

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent
        side="left"
        className={cn("w-[min(100%,280px)] border-r p-0", SHELL_CHROME_SURFACE)}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{t("navigation")}</SheetTitle>
        </SheetHeader>
        <ShellNav
          basePath={basePath}
          items={items}
          footer={footer}
          collapsed={false}
          onNavigate={() => setMobileOpen(false)}
          ariaLabel={ariaLabel}
        />
      </SheetContent>
    </Sheet>
  );
}
