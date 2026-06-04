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
        <span className="text-ink-2">
          {taken} / {total} runners
        </span>
        <span className={isOver ? "text-warn" : "text-ink-3"}>
          {isOver ? "Waitlist" : `${total - taken} spots left`}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-surface-2">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300",
            isOver ? "bg-warn" : "bg-brand"
          )}
          style={{
            width: `${pct}%`,
          }}
        />
      </div>
    </div>
  );
}
