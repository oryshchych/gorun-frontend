# AGENTS.md — gorun-client

> **This is the single source of truth for AI assistants working in this repo.**
> `CLAUDE.md`, `GEMINI.md`, and `.github/copilot-instructions.md` are symlinks to this file.
> Edit only this file. Cursor's project rules in `.cursor/rules/` reinforce specific slices.

---

## 1. Project Snapshot

**gorun-client** is a bilingual (uk / en) events registration and management platform. Users browse events, register (with optional promo codes), and organizers / admins manage events through a dedicated admin area. Built on Next.js 16 App Router with localized routing under `app/[locale]/...`. The default locale is `uk`.

---

## 2. Stack

| Concern         | Choice                                                                               | Version             |
| --------------- | ------------------------------------------------------------------------------------ | ------------------- |
| Framework       | Next.js (App Router)                                                                 | ^16.2.6             |
| Runtime         | React                                                                                | ^19.2.6             |
| Language        | TypeScript (strict)                                                                  | ^5.9.3              |
| Styling         | Tailwind CSS v4                                                                      | ^4.3.0              |
| UI primitives   | Radix UI + custom shadcn-style components (CVA)                                      | —                   |
| Forms           | react-hook-form + @hookform/resolvers                                                | ^7.76 / ^5.4        |
| Validation      | Zod                                                                                  | ^4.4.3              |
| i18n            | next-intl (uk default, en alternate)                                                 | ^4.12               |
| Server state    | TanStack React Query                                                                 | ^5.100              |
| HTTP            | axios (custom client + JWT refresh)                                                  | ^1.16               |
| Auth            | Custom JWT in localStorage via `tokenManager` (plus `next-auth` for OAuth bootstrap) | ^4.24               |
| Theming         | next-themes                                                                          | ^0.4                |
| Icons           | lucide-react                                                                         | ^0.577              |
| Testing         | Vitest + @testing-library/react + axios-mock-adapter                                 | ^4.1 / ^16.3 / ^2.1 |
| Lint / format   | ESLint 9 + Prettier 3                                                                | —                   |
| Package manager | npm (`package-lock.json` committed)                                                  | —                   |

Node 18+. Branch off `develop`.

---

## 3. Directory Map

```
/                          repo root
├── app/                   Next.js App Router
│   ├── [locale]/          localized routes (uk | en)
│   │   ├── (public)/      browsing, events list, marketing
│   │   ├── (auth)/        login, register, forgot/reset password
│   │   ├── (dashboard)/   my-events, my-registrations, profile (auth-gated client-side)
│   │   ├── (admin)/       admin event + promo code management
│   │   └── (legal)/       legal pages (terms, privacy)
│   ├── globals.css        Tailwind v4 `@theme inline` wiring + app shell styles
│   ├── tokens.css         unified light/dark design tokens
│   ├── layout.tsx         root layout
│   ├── sitemap.ts         next-sitemap
│   └── robots.ts          robots.txt route
├── components/
│   ├── ui/                shadcn-style primitives (button, input, form, select, …)
│   ├── admin/             AdminEventForm, AdminSidebar, PromoCodeForm
│   ├── auth/              login/register/forgot/reset components (+ __tests__)
│   ├── events/            EventCard, EventForm, EventDetails, EventList
│   ├── layout/            Header, navigation, shell (+ __tests__)
│   ├── profile/           profile editor / sections
│   ├── registration/      event-registration flow
│   ├── legal/             legal content rendering
│   ├── shared/            cross-feature widgets
│   └── providers/         QueryProvider, ThemeProvider, NextIntlClientProvider wiring
├── hooks/                 useAuth, useEvents, useRegistrations, useParticipants, useHydrated, useResponsiveImage
├── lib/
│   ├── api/               axios client + per-domain wrappers (auth, events, registrations, promo-codes, admin-promo-codes)
│   ├── validations/       Zod schemas per feature (event, admin-event, admin-promo-code, auth, profile, registration)
│   ├── forms/             form helpers (number-field, etc.)
│   ├── admin/             admin-only utilities (+ __tests__)
│   └── constants/         shared constants
├── types/                 TypeScript types (api, auth, event, registration, promo-code)
├── messages/              i18n JSON catalogs — en.json, uk.json (MUST stay in sync)
├── assets/                static assets
├── public/                public/static
├── middleware.ts          next-intl locale routing + CORS
├── i18n.ts                next-intl request config
├── next.config.mjs        next.config with next-intl plugin + remote image patterns
├── components.json        shadcn config (alias, style, base color)
├── vitest.config.ts       Vitest + jsdom + RTL setup
└── .claude/, .cursor/     AI tool config (this setup)
```

---

## 4. Commands

| Script                     | When to use                                         |
| -------------------------- | --------------------------------------------------- |
| `npm run dev`              | Local dev server (Next on http://localhost:3000)    |
| `npm run build`            | Production build — run before merging large changes |
| `npm run start`            | Run the prod build locally                          |
| `npm run type-check`       | `tsc --noEmit` for app code (run before pushing)    |
| `npm run type-check:tests` | `tsc --noEmit` for test sources                     |
| `npm run lint`             | ESLint (Next + Prettier configs)                    |
| `npm run lint:fix`         | Lint and auto-fix                                   |
| `npm run format`           | Prettier write across repo                          |
| `npm run format:check`     | Prettier check only                                 |
| `npm test`                 | Vitest, single run (no watch)                       |
| `npm run test:watch`       | Vitest watch mode                                   |
| `npm run test:ui`          | Vitest UI                                           |

**Pre-commit triad (always):** `npm run type-check && npm run lint && npm test && npm run format:check`.

---

## 5. Conventions

### Code quality — non-negotiable after every change

**Every touched file must be left with zero TypeScript errors, zero lint errors, and zero Prettier violations.** There are no exceptions — a change is not done until all three pass:

```
npm run type-check && npm run lint && npm run format:check
```

If any check fails, fix it before considering the task complete. Do not suppress errors with `// @ts-ignore`, `eslint-disable`, or similar — fix the root cause.

### TypeScript — no `any`

- **Never use `any`** (explicit or implicit). It silently defeats the type system. ESLint rule `@typescript-eslint/no-explicit-any` is set to `"error"` (see `eslint.config.mjs`) — the codebase is at zero violations, so any new `any` fails `npm run lint` and blocks the build.
  - Prefer `unknown` + type narrowing for truly unknown input.
  - Prefer generics (`<T>`) for reusable utilities.
  - Prefer `z.infer<typeof schema>` for form / API shapes.
- Strict mode is on (`"strict": true` in `tsconfig.json`, `noImplicitAny` enforced by ESLint).
- Do not cast with `as` to satisfy the compiler — refactor or add a real guard instead.
- Do not suppress with `// @ts-ignore` — use `// @ts-expect-error` with an explanation only when there is a confirmed upstream bug.

**Patterns that replace `any` (do this, not that):**

- **Caught errors:** write `catch (error) { … }` (TS infers `unknown`) and narrow — `error instanceof Error ? error.message : fallback`, or pass straight to `handleApiError` (its param is `unknown`). Never `catch (error: any)`.
- **Untyped objects (API payloads, error bodies):** narrow with a guard like `isRecord(value): value is Record<string, unknown>` before reading props. Don't read off `(value as any).foo`.
- **Backend field not on the domain type:** add it as an **optional** field to the canonical type in `types/<domain>.ts` (e.g. `bib?`, `distance?`, `kids?`) — fix it once at the source. Don't reach for `(obj as any).field` at each call site.
- **Generic defaults:** use `<T = unknown>`, never `<T = any>` (see `types/api.ts`).
- **react-hook-form generics:** the `TContext` slot is `unknown`, not `any` (`useForm<Input, unknown, Output>`, `Resolver<Input, unknown, Output>`).
- **Test mocks of components:** type props as `ComponentProps<"a">` / `ComponentProps<"img">` / `ComponentProps<typeof Foo>`. For a deliberately-invalid input, cast through the real type — `undefined as unknown as Event[]` — never `as any`.

### Imports & paths

- Always use the `@/*` path alias (configured in `tsconfig.json`). Avoid `../../..` for cross-feature imports.

### Components

- **File naming:** PascalCase for components (`EventCard.tsx`), camelCase for hooks/utils (`useEvents.ts`, `client.ts`), kebab-case for route segments (`my-events`).
- **`"use client"`** only when the file needs client APIs (hooks, browser, event handlers). Server components are the default in App Router.
- **Props** are typed via `interface ComponentNameProps { … }`. Shared types belong in `types/<domain>.ts` — don't redeclare them in components.
- **UI primitives** live in `components/ui/` and follow the shadcn + CVA + Radix Slot pattern (see `components/ui/button.tsx`). Use `cn()` from `@/lib/utils` for class merging.
- **Variants:** prefer the GoRun design-system variants (`brand`, `primary`, `soft`, `ghost-gr`, sizes `sm`/`md`/`lg`) for NEW UI. Legacy shadcn variants are kept for older components but should not be the default for new work.

### Forms

- **react-hook-form + `zodResolver`** — schemas live in `lib/validations/<feature>.ts`. Co-locate `defaultValues` derivation with the form component (or export a helper from the schema file).
- Use `components/ui/form.tsx` (`<Form>`, `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormMessage>`) for layout and accessibility.
- For dynamic field sets use `useFieldArray` (see `AdminEventForm.tsx` for the canonical pattern: gallery, perks, schedule, distances).
- For numeric inputs that may be empty, route through `lib/forms/number-field.ts` helpers (`emptyNumberToUndefined`, `parseIntFieldInput`, `formatNumberFieldValue`).
- Labels and button text use `useTranslations("scope.key")`. Zod schema error messages are currently English-only and surface as-is — keep them short and user-readable.

### Internationalization (THE big footgun)

- **Every key MUST exist in BOTH `messages/en.json` AND `messages/uk.json`.** A missing key in one locale silently breaks `next-intl` at runtime in that locale.
- **Never hardcode user-visible strings in JSX.** Every label, heading, link text, placeholder, and descriptive string a user reads must come from `useTranslations()` / `getTranslations()`. Raw English strings in JSX (e.g. `<p>Charity running events…</p>`) are always a bug — add the key to both locales and use `t("key")` instead.
- **Client components:** `const t = useTranslations("scope")` from `next-intl`.
- **Server components / metadata:** `const t = await getTranslations({ locale, namespace: "scope" })` from `next-intl/server`.
- The `[locale]` route segment is required for every user-facing page. Configured locales: `["uk", "en"]`; default: `uk`. See `i18n.ts` and `middleware.ts`.
- For bilingual user-generated content (event titles/descriptions), follow the `{ en, uk }` object pair pattern in Zod schemas — see `pair()` in `lib/validations/admin-event.ts`.

### Audit logging — check before shipping any mutation

When adding or editing a feature that **creates, updates, or deletes** backend data, ask: does the corresponding backend controller call `writeAuditLog()`? If you add a new mutation endpoint, the backend controller must be instrumented (see `gorun-backend/AGENTS.md` → "Audit logging"). On the frontend there is nothing to wire — the audit log page at `/admin/audit-logs` reads from the backend automatically.

The sidebar item for audit logs is **visible only to `super_admin` users** (checked via `isSuperAdminUser()` in `lib/admin/access.ts`). If you add new role-gated UI, follow the same pattern.

### Data layer

- **Never call `fetch` directly.** Use `apiClient` from `lib/api/client.ts` — it attaches JWT, refreshes on 401, normalizes errors.
- Each backend domain gets a wrapper file under `lib/api/<domain>.ts` (`auth.ts`, `events.ts`, `registrations.ts`, `promo-codes.ts`, `admin-promo-codes.ts`).
- Each domain gets a React Query hook file under `hooks/use<Domain>.ts` exporting `eventKeys`-style query-key factories and `useFooQuery` / `useFooMutation` hooks.
- **Standard `staleTime`** for read queries is `1000 * 60 * 5` (5 minutes). Mutations should invalidate the matching query-key prefix on success.
- Errors and success toasts go through `handleApiError` and `showSuccessToast` from `lib/error-handler` (uses Sonner).

### Auth

- Tokens (`access_token`, `refresh_token`) live in `localStorage` via `tokenManager`. **Never** read/write them directly — go through `tokenManager`.
- The 401 refresh flow is handled by the axios interceptor in `lib/api/client.ts`. Do not duplicate it.
- `useAuth()` from `hooks/useAuth.tsx` exposes the user + login/logout/register actions.
- Admin gating is handled by the admin route group's layout (client-side check). Backend enforces real authorization.

### Styling

- GoRun uses one design-token system. Tokens live in `app/tokens.css` (`:root` light values, `.dark` overrides from `next-themes`) and are exposed as Tailwind v4 utilities via `@theme inline` in `app/globals.css`.
- The brand action color `#2BC36B` is the only fixed value. Do not reintroduce `--gr-*`, `hsl(var(--...))`, `.gr-dark`, `.gr-light`, or Tailwind config color definitions.
- Never hardcode color in components, inline styles, or arbitrary Tailwind values. No hex, `rgb()`, `hsl()`, named colors, `bg-[#...]`, `text-[#...]`, or `border-[#...]`. Use token utilities (`bg-brand`, `text-ink`, `border-line`) or `var(--token)`.
- Never invent a color/token inline. If a genuinely new role is needed, add it to `app/tokens.css` for both `:root` and `.dark`, then expose it in `app/globals.css`.
- Dark mode is `.dark` only. Components should be written once with token utilities and adapt through token overrides; avoid color-specific `dark:` branches.
- Brand green is for actions and small accents only: CTAs, logo mark, focus rings, progress fills, selected states, and positive-status pills. Do not use brand green for body text, link text, or large neutral surfaces.
- Never put white text on bright brand green. On `bg-brand`, use `text-on-brand`. Use `bg-brand-strong text-white` only when white text on green is truly required.
- Text hierarchy stops at `ink`, `ink-2`, `ink-3`, `ink-4`. Do not add intermediate grays.
- Use the radius scale only: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, and `rounded-[var(--r-pill)]` for pill buttons. No arbitrary radii.
- Color is never the only signal. Status UI must include a label and/or icon, e.g. `Waitlist`, not just amber.
- Accessibility is a gate: target WCAG 2.2 AA, keep inputs at `text-base`/16px or larger, and make every interactive element show the `box-shadow: 0 0 0 4px var(--brand-glow)` focus ring.
- Preferred tokens: `brand`, `brand-hover`, `brand-active`, `brand-strong`, `brand-tint`, `on-brand`, `brand-glow`; `bg`, `surface`, `surface-2`; `line`, `line-strong`; `ink`, `ink-2`, `ink-3`, `ink-4`; `danger`, `danger-bg`, `warn`, `warn-bg`, `info`, `info-bg`, `success`, `success-bg`; `afu-blue`, `afu-yellow`; `shadow-sm/md/lg`; `r-sm/md/lg/xl/pill`.
- Legacy shadcn utilities (`bg-background`, `text-foreground`, `border-input`, etc.) still resolve through compatibility aliases, but prefer new GoRun utilities in any new or edited code.

### Tests

- **Vitest + Testing Library + axios-mock-adapter**, jsdom env, tests in colocated `__tests__/` folders.
- For component tests that hit the API or use i18n, wrap with `QueryClientProvider` + `NextIntlClientProvider` (see `components/auth/__tests__/` for the established wrapper).
- API wrapper tests mock axios with `MockAdapter` and assert the request URL/body and the normalized error shape.

---

## 6. Do / Don't

**Do**

- Reuse `lib/api/client.ts` + `tokenManager` for every HTTP call.
- Add keys to **both** `messages/en.json` and `messages/uk.json` in the same change.
- Co-locate Zod schemas in `lib/validations/<feature>.ts` and import types from there (`z.infer<typeof schema>`) rather than duplicating interfaces.
- Use route groups (`(public)`, `(auth)`, `(dashboard)`, `(admin)`, `(legal)`) under `app/[locale]/` to organize routes without affecting URLs.
- Run `type-check`, `lint`, `test` before commit.
- **Leave every touched file with zero TypeScript errors, zero lint errors, and zero Prettier violations.**

**Don't**

- Don't add a `pages/` directory — this project is App Router only.
- Don't hand-write `fetch` calls — go through `lib/api/<domain>.ts`.
- Don't read or write `localStorage` for tokens directly — go through `tokenManager`.
- Don't add a translation key to only one locale.
- Don't run `npm install` / dependency upgrades without explicit user approval (they're in the deny list of `.claude/settings.json`).
- Don't use legacy shadcn variants (`default`, `secondary`, etc.) for new UI — prefer the GoRun set.
- Don't bypass the `[locale]` segment for user-facing routes.
- **Don't use `any`** — ever. Use `unknown` + narrowing, generics, or `z.infer<>` instead.
- Don't suppress errors with `// @ts-ignore` or `eslint-disable` — fix the root cause.
- Don't hardcode component colors, use `hsl(var(--...))`, revive `--gr-*`, or add `.gr-dark` / `.gr-light`.

---

## 7. Where to look for X

| Need                                         | File                                           |
| -------------------------------------------- | ---------------------------------------------- |
| Axios instance + JWT attach                  | `lib/api/client.ts`                            |
| JWT refresh interceptor                      | `lib/api/client.ts` (same)                     |
| Token storage / `tokenManager`               | `lib/api/client.ts` (lower in file)            |
| Current user state + login/register/logout   | `hooks/useAuth.tsx`                            |
| Locale config / `locales` array              | `i18n.ts`                                      |
| Locale routing + CORS                        | `middleware.ts`                                |
| i18n message catalogs                        | `messages/en.json`, `messages/uk.json`         |
| Root layout (providers, fonts)               | `app/layout.tsx` and `app/[locale]/layout.tsx` |
| Design tokens                                | `app/tokens.css`                               |
| Tailwind token utility wiring                | `app/globals.css`                              |
| Canonical CVA + Radix Slot button            | `components/ui/button.tsx`                     |
| Canonical RHF + Zod + useFieldArray form     | `components/admin/AdminEventForm.tsx`          |
| Canonical Zod schema with bilingual `pair()` | `lib/validations/admin-event.ts`               |
| Canonical React Query hook file              | `hooks/useEvents.ts`                           |
| Canonical axios wrapper                      | `lib/api/events.ts`                            |
| Canonical API test                           | `lib/api/__tests__/auth.test.ts`               |
| Canonical component test                     | `components/auth/__tests__/`                   |
| shadcn alias / style config                  | `components.json`                              |

---

## 8. Workflow

1. Branch off `develop` (`git checkout -b feat/<scope>-<short-desc>`).
2. Implement, leaning on the agents/skills/commands in `.claude/` and the Cursor rules in `.cursor/rules/` for boilerplate.
3. Translation keys: add to **both** `messages/en.json` and `messages/uk.json`. Run `/sync-i18n` to verify parity.
4. Pre-commit: `npm run type-check && npm run lint && npm test`.
5. Commit using the existing repo style (lowercase type prefix `feat(scope):`, `fix(scope):`, `style(scope):`, `refactor(scope):`).
6. Open PR to `develop`.

---

## 9. AI tool topology (read once, then forget)

| File                              | Read by                                            | Notes                                                     |
| --------------------------------- | -------------------------------------------------- | --------------------------------------------------------- |
| `AGENTS.md`                       | Codex CLI, Aider, any AGENTS.md-aware tool, humans | **Source of truth.** Edit this.                           |
| `CLAUDE.md`                       | Claude Code                                        | Symlink → `AGENTS.md`.                                    |
| `GEMINI.md`                       | Gemini CLI                                         | Symlink → `AGENTS.md`.                                    |
| `.github/copilot-instructions.md` | GitHub Copilot                                     | Symlink → `../AGENTS.md`.                                 |
| `.claude/settings.json`           | Claude Code                                        | Permissions, hooks, env. Committed.                       |
| `.claude/settings.local.json`     | Claude Code                                        | Per-dev overrides. **Gitignored.**                        |
| `.claude/agents/*.md`             | Claude Code                                        | Specialized subagents (form builder, i18n, API wirer, …). |
| `.claude/skills/*/SKILL.md`       | Claude Code                                        | Procedural recipes for common flows.                      |
| `.claude/commands/*.md`           | Claude Code                                        | Slash commands (`/sync-i18n`, `/precommit`, …).           |
| `.cursor/rules/*.mdc`             | Cursor                                             | Path-scoped rules — auto-attach by glob.                  |
| `docs/ai/README.md`               | Humans                                             | How to maintain this setup.                               |
