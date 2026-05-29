---
name: scaffold-form
description: Scaffold a new react-hook-form + Zod form following the gorun-client conventions — Zod schema in lib/validations/, form component using components/ui/form.tsx, i18n labels via next-intl, useFieldArray for dynamic fields. Use when the user asks to create a new form or convert an ad-hoc form to RHF.
---

# Scaffold a Form

## Inputs

- Form name (e.g., `PromoCodeForm`, `EventRegistrationForm`)
- Domain (e.g., `admin`, `events`, `registration`)
- Field list with types
- Whether it's a create vs edit form
- The matching API mutation hook (or "needs to be added" → also invoke the api-integrator agent)

## Procedure

1. **Read reference templates first:**
   - Canonical form: `components/admin/AdminEventForm.tsx`
   - Canonical schema: `lib/validations/admin-event.ts`
   - Template file in this skill: `reference/form-template.tsx.txt`
2. **Author the Zod schema** at `lib/validations/<feature>.ts`:
   - One `schema` export
   - `export type <Feature>FormValues = z.infer<typeof schema>`
   - For bilingual content fields, use the `pair(min, max, field)` helper pattern
   - For numeric fields that may be empty, use `emptyNumberToUndefined` from `lib/forms/number-field`
3. **Author the form component** at `components/<domain>/<FormName>.tsx`:
   - `"use client"` at the top
   - `useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: ... })`
   - Wrap with `<Form>` from `components/ui/form.tsx`
   - Each field uses `<FormField control={form.control} name="..." render={({ field }) => (<FormItem><FormLabel>{t("...")}</FormLabel><FormControl>...</FormControl><FormMessage/></FormItem>)} />`
   - Submit button uses the GoRun variants (`<Button variant="brand" type="submit">{t("submit")}</Button>`)
   - For dynamic field sets, `useFieldArray({ control: form.control, name: "..." })`
4. **Add i18n keys** to BOTH `messages/en.json` and `messages/uk.json` (use the `add-translation-key` skill).
5. **Wire up submission:** import the matching mutation hook from `hooks/use<Domain>.ts`. The hook handles toasts and cache invalidation; the form just calls `.mutate(values)`.
6. **Run** `npm run type-check` to catch resolver / type mismatches.
7. **Author a test** (use the `write-vitest-test` skill).

## File shape

See `reference/form-template.tsx.txt` for the exact starting skeleton.

## Anti-patterns

- Inline Zod schema in the component file — extract to `lib/validations/`
- `useState` for individual field values — use RHF `register` / `control`
- Missing `<FormMessage />` — breaks error UX
- Direct `axios.post` in `onSubmit` — use the React Query mutation hook
- Hardcoded English labels — use `useTranslations`
