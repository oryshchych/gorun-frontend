import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ShellTable({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("shell-surface mt-8 overflow-hidden rounded-lg border shadow-sm", className)}>
      {children}
    </div>
  );
}

export function ShellTableScroll({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("overflow-x-auto", className)}>{children}</div>;
}

export function ShellTableHeadRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-b bg-gr-brand-50/40 text-left dark:bg-[var(--gr-surface-2)]",
        className
      )}
      {...props}
    />
  );
}

export function ShellTableBodyRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("shell-table-row", className)} {...props} />;
}
