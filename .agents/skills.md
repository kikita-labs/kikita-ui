# Skill Maintenance

Repo-distributed skills live under `.agents/skills/`. Developers can copy or
sync them into local Codex skill directories, but local customizations must not
be overwritten silently.

`SKILL.md` is the portable source of truth for each skill. Do not require
agent-specific metadata files for installation. A developer should be able to
ask their agent to install every skill from `.agents/skills/` by reading the
skill folders directly.

## Skill Shape

Each skill folder must contain:

```text
.agents/skills/<skill-name>/
  SKILL.md
```

Agent-specific adapter files may be added only when a real target agent cannot
consume `SKILL.md` directly. Do not add adapters speculatively, and do not
duplicate procedural instructions outside `SKILL.md`.

Follow `$skill-creator`:

- lowercase hyphenated folder name;
- frontmatter with only `name` and `description`;
- concise body with procedural knowledge;
- no extra README, changelog, or installation guide inside the skill;
- optional references only when progressive disclosure is useful.

## Required Repo Skills

- `kikita-ui-component-development`
- `kikita-ui-quality-gate`
- `kikita-ui-documentation-maintenance`
- `kikita-ui-skill-sync`

## Sync Policy

Use:

```bash
pnpm.cmd skills:check
pnpm.cmd skills:sync
```

The sync script compares repo skills with `$CODEX_HOME/skills`, then
`~/.codex/skills`. It reports missing, same, different, and local-only skills.
When a local skill differs from the repo copy, the default is to ask before
overwriting.

Agents must not overwrite a different local skill unless the user explicitly
confirms that replacement.

## Updating Skills

When a workflow changes:

1. Update the source `.agents/*.md` rule.
2. Update the matching `.agents/skills/*/SKILL.md`.
3. Run skill validation and `pnpm.cmd skills:check`.
4. Mention in the final response that developers should run
   `pnpm.cmd skills:sync` if they want local skills updated.
