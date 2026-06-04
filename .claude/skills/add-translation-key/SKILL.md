---
name: add-translation-key
description: Add a translation key (or set of keys) safely to BOTH messages/en.json and messages/uk.json. Use whenever new user-visible text appears in JSX or when an existing component needs a new translated string. Prevents the #1 bug in this repo — silently missing key in one locale.
---

# Add Translation Key

## Why this exists

`next-intl` will silently miss any key that exists in only one locale file. The runtime won't crash, but the user sees the key path as the text. This skill enforces atomic edits to both files.

## Inputs

- Dotted key path (e.g., `admin.eventForm.publishLabel`)
- English text
- Ukrainian text (or "TODO" if not yet available — flag explicitly)

## Procedure

1. **Locate the scope** in `messages/en.json`. Grep for the parent path (`admin.eventForm`, `auth`, `events`, `common`, etc.) to find the right object.
2. **Read the corresponding object** in `messages/uk.json` — the structures must mirror each other.
3. **Add the key in both files** using the Edit tool — same JSON pointer, two edits.
4. **Order:** insert near logically related siblings (don't append blindly to the end if there's an obvious group).
5. **If you must add a new top-level scope:** add the empty object to BOTH files first, then the keys.
6. **Verify parity:** run `/sync-i18n` (or grep for the new key in both files).
7. **Use in code:** `const t = useTranslations("scope")` (client) or `getTranslations({ locale, namespace: "scope" })` (server); reference as `t("publishLabel")`.

## Common scopes already in use

| Scope          | Used by                                            |
| -------------- | -------------------------------------------------- |
| `common`       | universal (Save, Cancel, Delete, Loading, etc.)    |
| `auth`         | login, register, forgot/reset password             |
| `admin`        | `admin.eventForm`, `admin.promoCodes`, `admin.nav` |
| `events`       | event listing, details, registration               |
| `profile`      | profile page, profile edit                         |
| `registration` | registration flow                                  |
| `legal`        | terms, privacy                                     |
| `apiCodes`     | success/error toast text keyed by backend code     |

## Bilingual content vs i18n keys (don't confuse them)

- **i18n keys** = UI labels in `messages/*.json`. This skill is for these.
- **Bilingual content** = user-generated data with separate `en` / `uk` values (event titles, descriptions). Lives in the database, validated by the `pair(min, max, field)` helper in `lib/validations/admin-event.ts`. Different concern.

## When done

Report:

- New keys (dotted paths)
- EN value
- UK value (or TODO flag)
- Both files edited
- Consumer file(s) using `useTranslations` / `getTranslations`

## Anti-patterns

- Adding a key to only one locale — refuse.
- Hardcoded English in JSX — convert.
- Inline `t("foo") || "Foo"` fallback — fix the key instead.
