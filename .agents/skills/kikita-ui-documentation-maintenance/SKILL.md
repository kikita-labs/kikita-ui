---
name: kikita-ui-documentation-maintenance
description: Maintain Kikita UI source documentation and agent documentation. Use when creating, reorganizing, or updating AGENTS.md, .agents rules, docs/*.md, component docs, roadmap, state coverage, changelog entries, release notes, or docs links in the kikita-ui repository.
---

# Kikita UI Documentation Maintenance

Use this skill when documentation is part of the change.

## Start

1. Read `AGENTS.md`, `.agents/documentation.md`, `.agents/agent-surface-source.md`,
   and `.agents/git-policy.md`.
2. Identify whether the doc is agent operating guidance, public package source
   documentation, release documentation, or local notes.
3. Keep tracked documentation English-only.

## Placement

- Put agent instructions in `.agents/*.md`.
- Put repo-distributed skills in `.agents/skills/*`.
- Put public component docs in `docs/<primitive>.md`.
- Put release process in `docs/release.md`.
- Put release-visible changes in `CHANGELOG.md`.
- Put temporary session notes only in ignored `.local-notes/`.

## Component Docs

For component docs, include stable headings for usage, API, accessibility, forms
when relevant, keyboard behavior when relevant, CSS hooks, and migration notes
when behavior changed. Keep examples copy-pasteable for consumers importing from
`@kikita-labs/ui`.

## Required Updates

When changing public primitive behavior, update:

- `docs/<primitive>.md`;
- `docs/state-coverage.md`;
- `docs/component-roadmap.md`;
- `CHANGELOG.md` when release-visible;
- matching skills or `.agents` docs when workflow changes.

Run `pnpm.cmd audit:static` and `pnpm.cmd skills:check` before handoff.
