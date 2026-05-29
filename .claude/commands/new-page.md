---
description: Scaffold a new App Router page under app/[locale]/(<group>)/<route>/ with i18n + metadata.
argument-hint: <route> <group>
allowed-tools: Read, Glob, Grep, Write, Edit, Bash(npm run type-check:*)
---

# /new-page

Create `app/[locale]/(<group>)/<route>/page.tsx` following the conventions in the `scaffold-locale-page` skill.

## Arguments

- `<route>` — URL segment(s) under the locale (e.g., `events`, `events/[id]`, `admin/promo-codes`)
- `<group>` — one of: `public`, `auth`, `dashboard`, `admin`, `legal`

## Procedure

1. Verify the group exists at `app/[locale]/(<group>)/`. If not, ask the user before creating it.
2. Use the template at `.claude/skills/scaffold-locale-page/reference/page-template.tsx.txt` as the starting shape.
3. Set up:
   - Typed `params: Promise<{ locale: Locale }>` (extend with `[id]` etc. if dynamic)
   - `setRequestLocale(locale)` at the top of the default export
   - `generateMetadata` exporting localized title + description
   - `getTranslations({ locale, namespace: "<scope>" })` for body text
4. Decide if a `layout.tsx` is needed at this level (only if you need state/wrapping beyond the group layout).
5. Add i18n keys via the `add-translation-key` skill — same edit covers BOTH `messages/en.json` AND `messages/uk.json`.
6. Run `npm run type-check` and the dev server to verify both `/uk/<route>` and `/en/<route>` render.

## Output

- File path(s) created
- The required i18n key tree
- Suggested follow-ups (link from a nav, add a test, etc.)
