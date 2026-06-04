import * as React from "react";
import { cn } from "@/lib/utils";

type TagTone = "neutral" | "brand" | "warn" | "dark";

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: TagTone;
}

const toneClasses: Record<TagTone, string> = {
  neutral: "bg-surface-2 text-ink-3",
  brand: "bg-brand-tint text-brand-active",
  warn: "bg-warn-bg text-warn",
  dark: "bg-ink text-bg",
};

export function Tag({
  tone = "neutral",
  className,
  children,
  ...props
}: TagProps) {
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
