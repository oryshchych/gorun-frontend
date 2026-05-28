"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isShellNavActive } from "./nav-active";
import type { ShellFooterLink, ShellNavItem } from "./types";

function navLinkClass(active: boolean, collapsed: boolean) {
  return cn(
    "shell-nav-link flex items-center rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
    collapsed ? "justify-center px-2 py-2.5" : "gap-2 px-3 py-2",
    active
      ? "shell-nav-link--active border-l-[3px] border-l-[var(--gr-brand)] bg-white font-semibold text-[var(--gr-ink)] shadow-sm dark:bg-[var(--gr-surface-2)]"
      : "border-l-[3px] border-l-transparent text-muted-foreground hover:bg-white/80 hover:text-[var(--gr-ink)] dark:hover:bg-[var(--gr-surface-2)]/80"
  );
}

export function ShellNav({
  basePath,
  items,
  footer,
  collapsed = false,
  onNavigate,
  ariaLabel,
}: {
  basePath: string;
  items: ShellNavItem[];
  footer?: ShellFooterLink;
  collapsed?: boolean;
  onNavigate?: () => void;
  ariaLabel: string;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <nav
        className={cn("flex flex-1 flex-col gap-1", collapsed ? "p-2" : "p-3")}
        aria-label={ariaLabel}
      >
        {items.map(({ segment, label, icon: Icon, exactOnly }) => {
          const href = segment ? `${basePath}/${segment}` : basePath;
          const active = isShellNavActive(pathname, basePath, segment, exactOnly);
          return (
            <Link
              key={segment || "root"}
              href={href}
              onClick={onNavigate}
              className={navLinkClass(active, collapsed)}
              aria-current={active ? "page" : undefined}
              title={collapsed ? label : undefined}
            >
              <Icon
                className={cn("size-4 shrink-0", active && "text-[var(--gr-brand)]")}
                aria-hidden
              />
              {!collapsed ? <span>{label}</span> : null}
            </Link>
          );
        })}
      </nav>

      {footer ? (
        <div
          className={cn(
            "shrink-0 border-t border-border",
            collapsed ? "p-2" : "p-3"
          )}
        >
          <Link
            href={footer.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center text-sm text-muted-foreground transition-colors hover:bg-white/80 hover:text-[var(--gr-ink)]",
              collapsed ? "justify-center p-2" : "gap-2 px-3 py-2"
            )}
            title={collapsed ? footer.label : undefined}
          >
            <footer.icon className="size-4 shrink-0" aria-hidden />
            {!collapsed ? <span>{footer.label}</span> : null}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
