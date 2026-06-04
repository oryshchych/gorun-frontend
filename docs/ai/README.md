# AI Tooling — Contributor Guide

This repo is configured to work with multiple AI coding assistants out of the box:

- **Claude Code** (`.claude/`)
- **Cursor** (`.cursor/rules/`)
- **GitHub Copilot** (`.github/copilot-instructions.md` symlink)
- **OpenAI Codex CLI**, **Aider**, **Gemini CLI**, anything that reads `AGENTS.md` / `GEMINI.md`

Everything is driven from a single source of truth — **[`AGENTS.md`](../../AGENTS.md)** at the repo root. The other tool-specific files are symlinks to it.

---

## Topology

```
AGENTS.md                            ← edit this; everything else is derived
CLAUDE.md                            → AGENTS.md (symlink)
GEMINI.md                            → AGENTS.md (symlink)
.github/copilot-instructions.md      → ../AGENTS.md (symlink)

.claude/
├── settings.json                    permissions + hooks (committed)
├── settings.local.json              per-dev overrides (gitignored)
├── agents/*.md                      specialized subagents (5)
├── skills/*/SKILL.md                procedural recipes (6)
└── commands/*.md                    slash commands (4)

.cursor/rules/
└── *.mdc                            path-scoped rules (9), numbered for ordering

docs/ai/README.md                    this file
```

---

## Which tool reads which file

| Tool                            | Files it reads                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Claude Code**                 | `CLAUDE.md` (→ `AGENTS.md`), all of `.claude/`, plus picks up Cursor rules informally via context |
| **Cursor**                      | `AGENTS.md` (via project context), all of `.cursor/rules/` (auto-attaches by glob)                |
| **GitHub Copilot**              | `.github/copilot-instructions.md` (→ `AGENTS.md`)                                                 |
| **Codex CLI / Aider / generic** | `AGENTS.md` directly                                                                              |
| **Gemini CLI**                  | `GEMINI.md` (→ `AGENTS.md`)                                                                       |

---

## Maintaining the setup

### Updating project conventions

Edit **`AGENTS.md`** at the repo root. That's it. The three symlinks pick up the change automatically. No need to update CLAUDE.md, GEMINI.md, or the Copilot file separately.

If a convention applies to a narrow file scope and isn't general enough for AGENTS.md, consider adding a rule under `.cursor/rules/` instead — they're glob-scoped and load lazily.

### Adding a Claude subagent

1. Create `.claude/agents/<name>.md` with frontmatter:
   ```yaml
   ---
   name: <kebab-case-name>
   description: <one-line trigger description — when to invoke proactively>
   tools: Read, Edit, Write, Grep, …
   model: inherit
   ---
   ```
2. Body: project context recap → what the agent specializes in → how it works → output contract → anti-patterns.
3. Test it: in a new Claude Code session, run `/agents` to see it listed, then ask a matching question and confirm it picks the right agent.

### Adding a Claude skill

1. Create the folder `.claude/skills/<skill-name>/`.
2. Add `SKILL.md` with frontmatter:
   ```yaml
   ---
   name: <skill-name>
   description: <when to use — Claude matches user request against this>
   ---
   ```
3. Body: numbered procedure, inputs, file shapes, anti-patterns.
4. Optional: add reference templates under `<skill-name>/reference/*.txt`. The skill body links to them.
5. Test it: paraphrase a task that should trigger it and confirm Claude invokes the skill.

### Adding a Claude slash command

1. Create `.claude/commands/<name>.md` with frontmatter:
   ```yaml
   ---
   description: <one-line summary>
   argument-hint: <args> [optional-args]
   allowed-tools: Read, Edit, Bash(npm run …:*), …
   ---
   ```
2. Body: argument schema, procedure, output format, anti-patterns.
3. Test it: type `/<name>` in Claude Code — should autocomplete; run it.

### Adding a Cursor rule

1. Create `.cursor/rules/<NN>-<slug>.mdc` (number for ordering — pair with existing 00-80 scheme).
2. Frontmatter:
   ```yaml
   ---
   description: <when this rule applies>
   globs: <comma-separated globs>
   alwaysApply: false # or true for the project-overview rule
   ---
   ```
3. Body: bullet-point rules. Keep it scannable.

### Updating permissions / hooks

Edit `.claude/settings.json`. Patterns:

- **Add an allowed Bash command:** add an entry like `"Bash(npm run something:*)"` to `permissions.allow`.
- **Block something destructive:** add to `permissions.deny`.
- **Format-on-edit:** already configured via `PostToolUse` running Prettier.
- **End-of-turn reminder:** already configured via `Stop` hook.

Per-developer overrides go in `.claude/settings.local.json` (gitignored).

---

## How to keep the setup honest

- **Anything in AGENTS.md that isn't true** is worse than missing — agents will follow it confidently into a wall. When refactoring code conventions, update AGENTS.md in the same PR.
- **Don't let `.cursor/rules/` drift from `AGENTS.md`.** The MDC rules should be focused slices of AGENTS.md, not parallel sources of different truth.
- **Skills/agents/commands reference real file paths.** When you move or rename a canonical file (`components/ui/button.tsx`, `hooks/useEvents.ts`, `lib/api/client.ts`, `lib/validations/admin-event.ts`), grep `.claude/` and `.cursor/` for the old path and update.
- **Bilingual i18n parity is the most-cited rule.** Run `/sync-i18n` periodically to catch drift early.

---

## Tooling-specific quirks worth knowing

- **Symlinks on Windows:** `ln -s` works on Linux/macOS. Windows contributors using WSL are fine; native Git for Windows needs `git config core.symlinks true` once. If symlinks are a problem in CI or for a teammate, switch the symlinks to one-line pointer files: `> CLAUDE.md "See AGENTS.md"`. This loses automatic content propagation but is portable.
- **Cursor MDC frontmatter:** `globs` is comma-separated, not a YAML array. `alwaysApply: true` overrides globs — use sparingly (only `00-project-overview.mdc`).
- **Claude subagents** have their own context window — they don't see the calling conversation. Give them everything they need in the system prompt body.
- **Claude skills** are loaded by the model when their `description` matches the user's request — make descriptions specific, not generic.

---

## Where to file issues with the AI setup

If a rule, agent, or skill is wrong or contradicts the actual code, open an issue or fix it directly:

- Wrong fact → edit `AGENTS.md`.
- Wrong glob / scope → edit the relevant `.cursor/rules/*.mdc`.
- Wrong procedure → edit the relevant `.claude/skills/*/SKILL.md`.
- Wrong trigger → edit the relevant `.claude/agents/*.md` `description:` frontmatter.
