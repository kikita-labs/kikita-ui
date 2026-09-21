---
name: kikita-ui-quality-gate
description: Run and interpret Kikita UI quality checks. Use when validating static audits, unit tests, builds, Playwright browser suites, accessibility, responsive behavior, visual smoke, SSR, hydration, skills, docs, or release readiness in the kikita-ui repository.
---

# Kikita UI Quality Gate

Use this skill to prove a Kikita UI change is ready.

## Start

1. Read `AGENTS.md` and `.agents/testing-and-quality.md`.
2. Run `git status --short`.
3. Choose the smallest gate that proves the changed surface, then run the full
   gate before release or broad handoff.

## Gates

Use `pnpm.cmd` on Windows if `pnpm.ps1` is blocked.

Read the fast and full command lists in `.agents/testing-and-quality.md` from
the repository root. Both include lint. Select the gate appropriate to the
changed surface; do not substitute an older copied list.

## Browser Review

Run focused projects when the full browser suite is unnecessary:

- `pnpm.cmd test:e2e`
- `pnpm.cmd test:a11y`
- `pnpm.cmd test:responsive`
- `pnpm.cmd test:visual`

Treat console errors, hydration mismatch messages, broken ARIA references,
horizontal page overflow, and unexplained visual diffs as blockers.

## Reporting

Report commands run and results. If a command cannot run, include the exact
reason and do not claim that gate passed.
