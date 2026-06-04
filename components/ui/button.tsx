import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all disabled:pointer-events-none disabled:bg-surface-2 disabled:text-ink-4 disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-brand aria-invalid:border-danger",
  {
    variants: {
      variant: {
        /* GoRun design-system variants (pill shape, use these for new UI) */
        brand:
          "rounded-[var(--r-pill)] bg-brand text-on-brand hover:bg-brand-hover active:scale-[0.97] active:bg-brand-active shadow-none",
        primary:
          "rounded-[var(--r-pill)] bg-ink text-bg hover:opacity-90 active:scale-[0.97]",
        soft: "rounded-[var(--r-pill)] bg-surface-2 text-ink border border-line hover:bg-line",
        "ghost-gr":
          "rounded-[var(--r-pill)] bg-transparent text-ink border border-line-strong hover:bg-surface-2",
        /* Legacy shadcn variants (keep for existing components) */
        default:
          "rounded-md bg-brand text-on-brand hover:bg-brand-hover active:scale-[0.98] shadow-sm",
        destructive:
          "rounded-md bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger",
        outline:
          "rounded-md border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "rounded-md hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        /* GoRun sizes: sm=h-9 md=h-12 lg=h-14 */
        sm: "h-9 px-3.5 text-sm",
        md: "h-12 px-[18px] text-[15px]",
        lg: "h-14 px-[22px] text-base",
        /* Legacy shadcn sizes */
        default: "h-9 px-4 py-2 text-sm",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
