---
name: write-vitest-test
description: Write a Vitest test for this repo — API wrapper test with axios-mock-adapter or a component test with QueryClient + NextIntl providers. Use after adding a new API wrapper, hook, or component.
---

# Write a Vitest Test

## Reference

- API wrapper test pattern: `lib/api/__tests__/auth.test.ts`
- Component test wrapper: `components/auth/__tests__/`
- Template: `reference/test-template.tsx.txt`

## Procedure

### A. API wrapper test (`lib/api/<domain>.ts`)

1. Create `lib/api/__tests__/<domain>.test.ts`.
2. Use `new MockAdapter(apiClient)` (imported from `@/lib/api/client`).
3. `beforeEach`: instantiate `MockAdapter`. `afterEach`: `mock.restore()`.
4. For each exported fn:
   - Happy path: `mock.onMETHOD("/path").reply(200, response)`. Assert URL + body via `expect(mock.history.METHOD[0].url).toBe(...)`.
   - Error path: `mock.onMETHOD("/path").reply(400, { ... })`. Assert rejection shape.

### B. Hook test (`hooks/use<Domain>.ts`)

1. Create `hooks/__tests__/use<Domain>.test.tsx`.
2. Build a `wrapper` that provides a fresh `QueryClient` (`new QueryClient({ defaultOptions: { queries: { retry: false } } })`) per test.
3. Use `renderHook(() => useFoo(...), { wrapper })` from `@testing-library/react`.
4. `await waitFor(() => expect(result.current.isSuccess).toBe(true))` then assert `result.current.data` shape.

### C. Component test (`components/<domain>/<Name>.tsx`)

1. Create `components/<domain>/__tests__/<Name>.test.tsx`.
2. Build `renderWithProviders(ui)` that wraps with:
   - `QueryClientProvider` (fresh `QueryClient` per test, retries off)
   - `NextIntlClientProvider` with `locale="en"` and `messages` loaded from a minimal fixture or `messages/en.json`
3. Drive interaction with `userEvent` (not raw `fireEvent`).
4. Query by accessible role first: `getByRole("button", { name: /save/i })`, `getByLabelText("Email")`. Fall back to test-id only when there's no role.

## After writing

Run `npm test -- <test-pattern>` and ensure it passes. Don't leave failing or skipped tests behind.

## Anti-patterns

- Hitting a real backend
- Reusing one `QueryClient` across tests (caches leak)
- Mocking `useTranslations` to return key paths — provide a real `NextIntlClientProvider` with messages instead
- Loose assertions (`expect(x).toBeDefined()`)
- Snapshot tests for non-trivial components
