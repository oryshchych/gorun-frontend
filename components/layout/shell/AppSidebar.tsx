"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useShell } from "./ShellProvider";
import { ShellNav } from "./ShellNav";
import { SHELL_CHROME_SURFACE } from "./shell-surface";
import type { ShellFooterLink, ShellNavItem } from "./types";

export function AppSidebar({
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
  const { collapsed, toggleCollapsed } = useShell();
  const t = useTranslations("shell");

  return (
    <aside
      className={cn(
        "hidden min-h-full shrink-0 flex-col border-r lg:flex",
        SHELL_CHROME_SURFACE,
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex shrink-0 items-center justify-end border-b border-border px-2 py-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={toggleCollapsed}
          aria-label={collapsed ? t("expandSidebar") : t("collapseSidebar")}
        >
          {collapsed ? (
            <ChevronRight className="size-4" aria-hidden />
          ) : (
            <ChevronLeft className="size-4" aria-hidden />
          )}
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <ShellNav
          basePath={basePath}
          items={items}
          footer={footer}
          collapsed={collapsed}
          ariaLabel={ariaLabel}
        />
      </div>
    </aside>
  );
}
