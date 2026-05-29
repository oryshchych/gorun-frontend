---
description: Scaffold a new component under components/<domain>/ following repo conventions.
argument-hint: <Name> <domain> [--test]
allowed-tools: Read, Glob, Grep, Write, Edit, Bash(npm run type-check:*)
---

# /new-component

Create `components/<domain>/<Name>.tsx` (and optionally `__tests__/<Name>.test.tsx`) following the gorun-client conventions.

## Arguments

- `<Name>` — PascalCase component name (e.g., `PromoCodeRow`)
- `<domain>` — one of: `admin`, `auth`, `events`, `layout`, `profile`, `registration`, `legal`, `shared`, `ui`
- `--test` (optional) — also scaffold a colocated Vitest test

## Procedure

1. Confirm the domain folder exists; if not, ask the user before creating it.
2. Decide server vs client:
   - Add `"use client"` ONLY if the component needs hooks / browser APIs / event handlers.
   - For `ui/` primitives, default to client-friendly and use the `add-shadcn-primitive` skill template (CVA + Slot + cn).
3. Create the file with:
   - Typed props interface `interface <Name>Props { ... }`
   - PascalCase function export
   - `useTranslations` if any user-visible text is shown (and add the keys via the `add-translation-key` skill)
   - `cn` from `@/lib/utils` for class merging
   - GoRun design tokens / variants
4. If `--test` flag passed, scaffold `components/<domain>/__tests__/<Name>.test.tsx` using the `write-vitest-test` skill template.
5. Run `npm run type-check` and report.

## Output

- Full path(s) of created file(s)
- One-line description of what the component does
- Suggested next step (wire it up where, etc.)

## Anti-patterns

- Cross-domain imports through `../` — always use `@/`
- Inline English strings — go through `useTranslations`
- New CSS files — use Tailwind utilities + tokens
