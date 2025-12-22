"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, disabled, onChange, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          checked: !checked,
        },
        currentTarget: {
          ...e.currentTarget,
          checked: !checked,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange?.(syntheticEvent);
    };

    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="sr-only"
          {...props}
        />
        <div
          onClick={handleClick}
          className={cn(
            "h-4 w-4 rounded border-2 flex items-center justify-center transition-all",
            checked
              ? "bg-[#48C773] border-[#48C773]"
              : "bg-background border-input",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
            "focus-within:ring-[#48C773] focus-within:ring-2 focus-within:ring-offset-2",
            className
          )}
        >
          {checked && <Check className="h-3 w-3 text-white stroke-3" />}
        </div>
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
