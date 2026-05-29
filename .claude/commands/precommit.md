---
description: Run the pre-commit triad — type-check, lint, test — and surface failures with file pointers.
argument-hint:
allowed-tools: Bash(npm run type-check:*), Bash(npm run lint:*), Bash(npm test:*), Bash(npm run test:*), Read
---

# /precommit

Run the pre-commit verification suite for gorun-client. Use this before opening a PR.

## Procedure

Run each in sequence, stopping on the first failure:

1. `npm run type-check`
   - Reports TypeScript errors with file:line pointers.
   - If failures, summarize each error and the file responsible; do NOT attempt fixes without user direction.

2. `npm run lint`
   - ESLint across the repo.
   - If failures, try `npm run lint:fix` ONLY if the user confirms.

3. `npm test`
   - Vitest in single-run mode.
   - If failures, report which test(s) failed and the diff between expected/actual.

## Output

- A status table:
  ```
  type-check: ✅ / ❌  (errors: N)
  lint:       ✅ / ❌  (warnings: N, errors: N)
  test:       ✅ / ❌  (failed: N, passed: N, total: N)
  ```
- For each failure, the offending file path and a 1-2 line excerpt.
- A suggested next action.

## Anti-patterns

- Hiding failures or marking the run green when something failed
- Auto-fixing without confirmation (lint:fix can change semantics in some cases)
- Skipping a step because "we know it passes"
