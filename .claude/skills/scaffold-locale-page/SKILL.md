---
name: scaffold-locale-page
description: Create a new App Router page under app/[locale]/(<group>)/<route>/page.tsx with proper params typing, generateMetadata, and i18n. Use when the user asks to add a new route or page in this Next.js 16 app.
---

# Scaffold Locale Page

## Inputs

- Route segment (e.g., `events`, `events/[id]`, `admin/promo-codes`)
- Route group (`(public)`, `(auth)`, `(dashboard)`, `(admin)`, `(legal)`) — pick by audience
- Whether this is a server component (default) or has interactive parts
- Whether the page needs SEO metadata

## Procedure

1. **Decide the path.** Format: `app/[locale]/(<group>)/<route>/page.tsx`. Use a sibling `layout.tsx` only if THIS route needs an additional wrapper beyond the group layout.
2. **Decide server vs client.** Default = server. Add `"use client"` ONLY if the page itself needs hooks. For interactive islands, extract them into `components/<domain>/<Name>.tsx` and import them from the server page.
3. **Type the params** — Next 16 awaits params:
   ```ts
   { params: Promise<{ locale: Locale; ...dynamic }> }
   ```
4. **For server-side translations**, use `getTranslations({ locale, namespace })` from `next-intl/server`.
5. **For SEO**, export `generateMetadata` that pulls strings via `getTranslations`.
6. **Add i18n keys** to both `messages/en.json` and `messages/uk.json` (use the `add-translation-key` skill).
7. **Verify in browser** at BOTH `/uk/<route>` and `/en/<route>`.

## File shape

See `reference/page-template.tsx.txt` for the server-component template.

## Anti-patterns

- Skipping the `[locale]` segment for a user-facing route
- Using `getServerSideProps` / `getStaticProps` — App Router doesn't use those
- Hardcoded English in JSX or metadata
- Adding `"use client"` for no reason
- Putting interactive UI directly in the page when it could be a server page importing a client island
