"use client";

import type { ReactNode } from "react";
import { ShellProvider } from "./ShellProvider";
import { AppSidebar } from "./AppSidebar";
import { ShellMobileDrawer } from "./ShellMobileDrawer";
import { ShellTopBar } from "./ShellTopBar";
import type { ShellFooterLink, ShellNavItem } from "./types";

export type AppShellProps = {
  children: ReactNode;
  basePath: string;
  navItems: ShellNavItem[];
  navAriaLabel: string;
  footer?: ShellFooterLink;
  mobileTitle?: string;
};

function AppShellInner({
  children,
  basePath,
  navItems,
  navAriaLabel,
  footer,
  mobileTitle,
}: AppShellProps) {
  return (
    <div data-shell="true" className="flex min-h-0 w-full flex-1 flex-col">
      <ShellTopBar title={mobileTitle} />
      <ShellMobileDrawer
        basePath={basePath}
        items={navItems}
        footer={footer}
        ariaLabel={navAriaLabel}
      />
      <div className="flex min-h-0 flex-1">
        <AppSidebar
          basePath={basePath}
          items={navItems}
          footer={footer}
          ariaLabel={navAriaLabel}
        />
        <div className="shell-main min-w-0 flex-1 overflow-auto">
          <div className="p-4 md:p-6 lg:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function AppShell(props: AppShellProps) {
  return (
    <ShellProvider>
      <AppShellInner {...props} />
    </ShellProvider>
  );
}
