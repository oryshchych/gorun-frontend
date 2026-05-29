---
name: add-api-endpoint
description: Wire a new backend endpoint end-to-end — types in types/<domain>.ts, axios wrapper in lib/api/<domain>.ts, React Query hook in hooks/use<Domain>.ts. Use when the user mentions a new endpoint, fetch, submit, or backend integration.
---

# Add an API Endpoint

## Inputs

- HTTP method + path (e.g., `GET /events/:id/participants`, `POST /promo-codes`)
- Request payload shape (if any)
- Response shape
- Whether it's a query (read) or mutation (write)
- Cache invalidation targets (which `queryKey` prefixes should refresh on mutation success)

## Procedure

1. **Read the canonical templates first:**
   - `lib/api/events.ts` (axios wrapper)
   - `hooks/useEvents.ts` (React Query hook + keys factory)
   - `types/event.ts` (types)
   - `reference/query-template.ts.txt` in this skill (compact template)

2. **Add types** in `types/<domain>.ts`:
   - Request payload: `CreateFooRequest`, `UpdateFooRequest`
   - Response entity: `Foo`
   - For paginated lists, use `PaginatedResponse<Foo>` from `types/api.ts`

3. **Add axios wrapper** in `lib/api/<domain>.ts`:
   ```ts
   import apiClient from "./client";
   import type { Foo, CreateFooRequest } from "@/types/foo";
   import type { PaginatedResponse } from "@/types/api";

   export interface GetFoosParams { /* ... */ }

   export const getFoos = async (params: GetFoosParams = {}): Promise<PaginatedResponse<Foo>> => {
     const response = await apiClient.get<PaginatedResponse<Foo>>("/foos", { params });
     return response.data;
   };
   ```
   - **Never** create a new `axios.create`.
   - **Never** import `axios` directly here — go through `apiClient`.

4. **Add React Query hook** in `hooks/use<Domain>.ts`:
   - Define the keys factory at the top:
     ```ts
     export const fooKeys = {
       all: ["foos"] as const,
       lists: () => [...fooKeys.all, "list"] as const,
       list: (params: GetFoosParams) => [...fooKeys.lists(), params] as const,
       details: () => [...fooKeys.all, "detail"] as const,
       detail: (id: string) => [...fooKeys.details(), id] as const,
     };
     ```
   - Read hooks: `useQuery({ queryKey: fooKeys.list(params), queryFn: () => getFoos(params), staleTime: 1000 * 60 * 5 })`
   - Mutations: invalidate via `queryClient.invalidateQueries({ queryKey: fooKeys.lists() })` on success; toast via `showSuccessToast` / errors via `handleApiError` from `lib/error-handler`.

5. **Run `npm run type-check`** to catch drift.

6. **Add a test** for the wrapper (use the `write-vitest-test` skill — axios-mock-adapter pattern).

## File shape

See `reference/query-template.ts.txt`.

## Anti-patterns

- Direct `fetch` / new `axios.create`
- Inline `queryKey: ["foo", id]` instead of a `fooKeys` factory
- Mutation `onSuccess` that doesn't invalidate the right prefix
- Toast-spam from both the hook AND the component — toasts live in the hook
- Re-declaring types that already exist in `types/`
