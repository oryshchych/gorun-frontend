import type { LucideIcon } from "lucide-react";

export type ShellNavItem = {
  segment: string;
  label: string;
  icon: LucideIcon;
  /** Match pathname exactly (e.g. dashboard, profile root). */
  exactOnly?: boolean;
};

export type ShellFooterLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};
