import * as React from "react";
import { cn } from "@/lib/utils";

type TagTone = "neutral" | "brand" | "warn" | "dark";

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: TagTone;
}

const toneClasses: Record<TagTone, string> = {
  neutral: "bg-[var(--gr-surface-2)] text-[var(--gr-ink-2)]",
  brand: "bg-[var(--gr-brand-50)] text-[var(--gr-brand-700)]",
  warn: "bg-[var(--gr-warn-bg)] text-[var(--gr-warn)]",
  dark: "bg-[var(--gr-ink)] text-[var(--gr-bg)]",
};

export function Tag({ tone = "neutral", className, children, ...props }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em]",
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
