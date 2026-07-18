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

Fast gate:

```bash
pnpm.cmd audit:static
pnpm.cmd test:scripts
pnpm.cmd test
```

Full gate:

```bash
pnpm.cmd format:check
pnpm.cmd audit:static
pnpm.cmd skills:check
pnpm.cmd test:scripts
pnpm.cmd test
pnpm.cmd build
pnpm.cmd build:playground
pnpm.cmd test:ssr
pnpm.cmd test:browser
```

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
