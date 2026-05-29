---
description: Analyze the current diff for cross-repo contract changes (API, types, env, auth, errors) and emit a paste-ready prompt for the sibling repo.
argument-hint: [--range <git-range>] [--target <name-or-path>] [--quiet]
allowed-tools: Read, Glob, Grep, Bash(git diff:*), Bash(git log:*), Bash(git status:*), Bash(git rev-parse:*), Bash(git branch:*)
---

# /cross-repo-sync

Detect whether the current diff likely requires matching changes in a sibling repository (frontend ↔ backend), and emit a structured prompt for that repo's Claude Code session.

## When to invoke

After making changes that touch any of:
- API client wrappers / route handlers
- Request/response types or DTOs / shared schemas
- Env vars consumed by either side
- Auth headers / tokens / cookies
- Error codes / status code conventions
- Pagination / filter / sort param shapes

Not needed for: pure UI tweaks, copy edits, internal refactors with stable contracts, tests.

## Arguments

- `--range <git-range>` — git range to analyze. Defaults to staged+unstaged (`HEAD` working tree).
  - Common: `develop..HEAD` (whole branch), `HEAD~1` (last commit), `<commit>..<commit>`
- `--target <name-or-path>` — sibling repo name or absolute path (used only to label the prompt). If absent, ask the user.
- `--quiet` — emit ONLY the final prompt block, no preamble.

## Procedure

### 1. Identify scope
- If `--range` was supplied, `git diff <range>`. Otherwise compare working tree against `HEAD` (`git diff HEAD`) PLUS include unstaged via `git diff` and staged via `git diff --cached`. Dedupe by path.
- Capture: list of changed files, last commit hash + subject (`git log -1 --pretty=format:"%h %s"`), current branch (`git rev-parse --abbrev-ref HEAD`).
- If diff is empty, abort with: `No changes detected in range — nothing to sync.`

### 2. Identify this repo's role (informational)
Inspect:
- `package.json` → React/Next/Vue/Angular keys → frontend
- `pyproject.toml` / `requirements.txt` → FastAPI/Django/Flask → backend
- `go.mod` → Go service → backend
- `Cargo.toml` → Rust → backend
- `pom.xml` / `build.gradle` → JVM → backend
- `Gemfile` → Rails → backend

This is only used to label the source side of the prompt. The detection heuristics below are stack-agnostic.

### 3. Scan for cross-repo signals

For every changed file, apply these heuristics. Bias toward false positives over false negatives — better to surface a non-issue than miss a contract drift.

**A. HTTP route/path strings** — surface any modified line containing:
- Method + path literals: `GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS` followed by a `/path/like/this` (URL-y)
- Axios/fetch calls: `apiClient.<method>("...")`, `fetch("...", ...)`, `axios.<method>("...")`
- Backend route definitions: `@(Get|Post|Put|Patch|Delete)("...")`, `router.<method>("...")`, `app.<method>("...")`, `path("...", ...)`, etc.
- OpenAPI / route files: any file matching `**/routes/**`, `**/controllers/**`, `**/api/**`, `**/handlers/**`, `**/endpoints/**`

**B. Shared types / DTOs / schemas** — flag changes in files matching:
- `types/**`, `**/dto/**`, `**/dtos/**`, `**/schemas/**`, `**/models/**`, `**/entities/**`
- Zod / Joi / Yup / Pydantic / marshmallow / Marshal schema files
- OpenAPI / GraphQL SDL files (`.openapi.*`, `*.graphql`, `*.gql`)
- Generated files (Prisma `schema.prisma`, TypeORM entities, SQLAlchemy models, GORM models)

**C. Env vars** — grep diff for new/changed lines in:
- `.env.example`, `.env.sample`, `.env.template`
- `process.env.X`, `os.getenv("X")`, `Deno.env.get("X")`, `std::env::var("X")`
- Config files (`config.*`, `settings.*`) referencing env

Flag both newly referenced env vars AND removed ones.

**D. Auth / session** — any modified line containing:
- `Authorization`, `Bearer `, `X-API-Key`, `cookie`, `session`, `csrf`, `jwt`, `refresh_token`, `access_token`
- Middleware files (`middleware.*`, `**/middleware/**`, `**/guards/**`, `**/interceptors/**`)

**E. Error / status codes** — any modified line with:
- `status: \d{3}`, `statusCode: \d{3}`, `res.status(\d{3})`, `HTTPException(status_code=`, `throw new HttpException`, `c.JSON(\d{3}`, `w.WriteHeader(\d{3}`
- Custom error code enums or `apiCodes` namespace strings

**F. Pagination / filter conventions** — any param literal containing:
- `page`, `limit`, `offset`, `cursor`, `pageSize`, `perPage`, `sort`, `order`, `q`, `search`, `filter`
- When the param NAME appears as a new key in a request object

### 4. Cluster findings

Group findings into sections (omit empty sections):

```
1. API contracts changed     — list each (method + path + nature of change)
2. Shared types / DTOs       — list each (entity + fields added/removed/changed)
3. Env vars                  — added / removed / renamed
4. Auth / session            — what changed
5. Error / status codes      — what changed
6. Pagination / filter       — what changed
```

For each finding, capture:
- One-line description
- Source file path + line range (link as `path:start-end`)
- A short relevant diff snippet (3-10 lines of context)

### 5. Confirm with the user (unless --quiet)

If 1+ findings: list them as a numbered preview and ask the user to confirm / drop any false positives before emitting the final prompt.

If 0 findings: print `No cross-repo signals detected in this range.` and exit.

### 6. Resolve target name
- If `--target` provided, use it verbatim.
- Else inspect `~/Documents/Personal/`, `~/code/`, `~/src/`, `~/dev/` for sibling repos with similar root names (e.g., `gorun-client` → look for `gorun-server`, `gorun-api`, `gorun-backend`). If exactly one match, suggest it.
- Else ask the user: "Target repo name or path?"

### 7. Emit the final prompt

Output a single fenced markdown block that the user can copy-paste verbatim into the OTHER repo's Claude Code session. Format:

````markdown
# Cross-repo sync request — adapt to changes from `<source-repo-name>`

## Context

Source: `<source-repo-name>` @ branch `<branch>`, range `<range>` (head: `<short-hash> <subject>`)

These changes appear to affect contracts shared with this repo. Use your project's conventions (AGENTS.md, agents, skills) to apply the matching changes on this side. Don't blindly copy — adapt to this repo's patterns.

## Detected impact

<one section per non-empty cluster — see step 4>

### API contracts
- **`<METHOD> <path>`** — <one-line nature of change>
  Source: `<file>:<line-range>`

### Shared types / DTOs
- **`<TypeName>`** — <added/removed/changed fields>
  Source: `<file>:<line-range>`

(…etc per cluster)

## Relevant diff excerpts (source side)

<for each finding, a short fenced diff block with the actual hunk>

```diff
--- a/<file>
+++ b/<file>
@@ -<old> +<new> @@
<lines>
```

## Asks (concrete, per cluster)

1. **API contracts:** Update your route handler(s) for `<METHOD> <path>` to accept/return the changed shape. If you use OpenAPI/Swagger/GraphQL SDL, update it. Update any DB queries the endpoint depends on.
2. **Types/DTOs:** Mirror the field additions/removals on your side (response shape, validation schema, persisted model if it's a stored field).
3. **Env vars:** If `<VAR>` should be configured on this side too, add it to `.env.example` with a comment about purpose.
4. **Auth/session:** <specific ask>
5. **Errors/status codes:** Align your error responses to use the same codes the client now expects.
6. **Pagination/filter:** Adjust query handling to support the new params.

## Verification

- Run this project's pre-commit triad (type-check, lint, test).
- If you have contract tests / API integration tests against the other side, run them.
- If you have generated clients (OpenAPI codegen, GraphQL codegen), regenerate.

## What NOT to do

- Don't introduce changes outside this contract sync's scope.
- Don't update package versions of the other side.
- If a finding doesn't apply to your side (e.g., you're a different microservice), say so explicitly in your response — don't silently skip.

## Source commit reference

`<commit-hash>` on branch `<branch>` (range: `<range>`)
````

## Output behavior

- Unless `--quiet`: print a one-line summary first (`Found N findings across <clusters>; emitting prompt for <target>.`), then the prompt block.
- With `--quiet`: print ONLY the fenced prompt block — useful when piping to `pbcopy` or similar.

## Anti-patterns to refuse

- Emitting a prompt with zero findings (just abort with the "no signals" message)
- Including unrelated diff hunks for noise — keep excerpts tight
- Auto-running the prompt against the other repo without user paste — this command's job is to GENERATE, not EXECUTE on the other side
- Guessing the target repo when there's no obvious sibling — ask the user
- Fabricating asks not grounded in a real finding
