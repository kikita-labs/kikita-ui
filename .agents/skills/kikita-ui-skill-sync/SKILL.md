---
name: kikita-ui-skill-sync
description: Synchronize Kikita UI repo-distributed skills with a local Codex skills directory. Use when checking, installing, updating, or comparing .agents/skills against $CODEX_HOME/skills or ~/.codex/skills without silently overwriting user-customized local skills.
---

# Kikita UI Skill Sync

Use this skill to help developers install or update repo-distributed skills.

## Start

1. Read `AGENTS.md` and `.agents/skills.md`.
2. Inspect `.agents/skills/`.
3. Use `pnpm.cmd skills:check` to compare without writing.

## Sync

Default target resolution:

1. `$CODEX_HOME/skills` when `CODEX_HOME` is set.
2. `~/.codex/skills` otherwise.

Run:

```bash
pnpm.cmd skills:sync
```

The sync command reports:

- `missing`: repo skill is not installed locally;
- `same`: repo and local skill match;
- `different`: local skill exists but differs from the repo skill;
- `local-only`: local skill is not distributed by this repo.

## Overwrite Policy

Never overwrite a different local skill silently. If the user wants repo skills
to replace local customizations, use the script's explicit overwrite option or
confirm interactively when prompted.

After sync, run `pnpm.cmd skills:check` again and report the resulting status.
