---
name: add-shadcn-primitive
description: Add a new shadcn-style UI primitive to components/ui/ — CVA variants, Radix Slot for asChild, cn() merging, GoRun design tokens. Use when the user asks for a new generic input/button/card-like primitive.
---

# Add shadcn Primitive

## Reference

The canonical example is `components/ui/button.tsx`. Read it first.

## Procedure

1. **Confirm the primitive doesn't already exist** in `components/ui/`. Don't duplicate.
2. **Decide the API surface:**
   - Variants (visual style) and sizes — defined via `cva()`
   - Polymorphism: support `asChild` via `@radix-ui/react-slot` if the primitive should be able to render as a different tag
   - Wrapped Radix component (for primitives like Select, Dialog, DropdownMenu, Tabs)
3. **File shape:**
   ```tsx
   import * as React from "react";
   import { Slot } from "@radix-ui/react-slot"; // if polymorphic
   import { cva, type VariantProps } from "class-variance-authority";

   import { cn } from "@/lib/utils";

   const fooVariants = cva(
     "base utility classes",
     {
       variants: {
         variant: {
           brand: "GoRun design — pill, --gr-* tokens",
           // legacy shadcn variants only if needed for back-compat
         },
         size: {
           sm: "h-9 px-3.5 text-sm",
           md: "h-12 px-[18px] text-[15px]",
           lg: "h-14 px-[22px] text-base",
         },
       },
       defaultVariants: { variant: "brand", size: "md" },
     }
   );

   function Foo({
     className,
     variant,
     size,
     asChild = false,
     ...props
   }: React.ComponentProps<"…"> & VariantProps<typeof fooVariants> & { asChild?: boolean }) {
     const Comp = asChild ? Slot : "…";
     return <Comp className={cn(fooVariants({ variant, size, className }))} {...props} />;
   }

   export { Foo, fooVariants };
   ```
4. **Design tokens:** prefer `var(--gr-brand)`, `var(--gr-ink)`, `var(--gr-surface-2)`, `var(--gr-line)` etc. defined in `app/globals.css`. Don't introduce new hardcoded colors.
5. **GoRun sizes** (`sm | md | lg`) are h-9 / h-12 / h-14. Keep new primitives consistent with those.
6. **Export `<Foo>Variants`** so consumers can pull `VariantProps` if they wrap it.

## Anti-patterns

- Hardcoded hex colors instead of `--gr-*` tokens
- Local class-merging instead of `cn()`
- Skipping `asChild` when polymorphism makes sense (text-as-link, etc.)
- Inventing a new size scale instead of `sm` / `md` / `lg`
- Adding a primitive to `components/<domain>/` instead of `components/ui/`
