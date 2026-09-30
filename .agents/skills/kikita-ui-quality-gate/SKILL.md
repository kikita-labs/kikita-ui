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

Run focused suites when the full browser run is unnecessary:

- `pnpm.cmd test:browser` (builds the Playground, then runs the `behavior` project)
- `pnpm.cmd test:ssr` (builds the Playground, then runs only the SSR hydration spec)
- `pnpm.cmd test:visual` (Playground screenshots, runs in Docker)

For one page, run `pnpm.cmd exec playwright test --project=behavior <page>-playground` after
`pnpm.cmd build:playground`.

Treat console errors, hydration mismatch messages, broken ARIA references,
horizontal page overflow, and unexplained visual diffs as blockers.

Browser specs import `test` from `projects/kikita-ui-playground/e2e/support/fixtures.ts`,
which fails a test at teardown for any console or page error. Suites fail on a stale
or missing build; `test:browser` and `test:ssr` rebuild first. Read the
harness rules in `.agents/testing-and-quality.md` and the coverage map and known
gaps in `docs/browser-test-coverage.md` before adding or judging a browser test.
Report automated axe results separately from manual keyboard and screen-reader
review.

## Reporting

Report commands run and results. If a command cannot run, include the exact
reason and do not claim that gate passed.
