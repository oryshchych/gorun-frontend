import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  taken: number;
  total: number;
  className?: string;
}

export function ProgressBar({ taken, total, className }: ProgressBarProps) {
  const pct = Math.min(100, (taken / total) * 100);
  const isOver = taken > total;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between mb-1.5 text-xs font-semibold">
        <span style={{ color: "var(--gr-ink-2)" }}>
          {taken} / {total} runners
        </span>
        <span style={{ color: isOver ? "var(--gr-warn)" : "var(--gr-ink-3)" }}>
          {isOver ? "Waitlist" : `${total - taken} spots left`}
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--gr-surface-2)" }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{
            width: `${pct}%`,
            background: isOver ? "var(--gr-warn)" : "var(--gr-brand)",
          }}
        />
      </div>
    </div>
  );
}
