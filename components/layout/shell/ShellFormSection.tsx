import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ShellFormSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("shell-surface space-y-4 rounded-lg border p-4 md:p-6", className)}>
      {children}
    </section>
  );
}
