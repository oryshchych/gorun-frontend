---
description: Verify and report any drift between messages/en.json and messages/uk.json. Optionally insert TODO stubs for missing keys.
argument-hint: [--fix]
allowed-tools: Read, Edit, Write, Bash(node:*), Bash(npx:*)
---

# /sync-i18n

Audit translation parity between `messages/en.json` and `messages/uk.json`. Optionally insert TODO stubs where one side is missing a key.

## Arguments

- (none) — report-only mode (default)
- `--fix` — also insert `__TODO__` string stubs in the missing locale so subsequent edits are guided

## Procedure

1. Read both `messages/en.json` and `messages/uk.json`.
2. Recursively walk the trees and collect every leaf key path.
3. Compute the symmetric difference:
   - Keys present only in EN
   - Keys present only in UK
4. Report a structured table:
   - Total keys per file
   - Keys missing in UK (with EN values shown)
   - Keys missing in EN (with UK values shown)
   - Type mismatches (e.g., string vs object at the same path)
5. If `--fix`:
   - For each missing-in-UK key, insert `"__TODO__"` at the same JSON pointer in `messages/uk.json` (preserving sibling ordering).
   - For each missing-in-EN key, insert `"__TODO__"` at the same JSON pointer in `messages/en.json`.
   - Re-validate parity after the writes.
6. Always run `npx prettier --write messages/en.json messages/uk.json` after any write so JSON stays canonically formatted.

## Output

- Counts before/after
- Lists of drifts (full dotted paths)
- Files touched (if `--fix`)
- Reminder: every `__TODO__` value must be replaced with a real translation before merge

## Anti-patterns to refuse

- Deleting keys from one locale to "match" the other — always pad missing keys instead, then ask the user which they actually want
- Reordering unrelated keys
