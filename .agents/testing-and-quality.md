# Testing And Quality Gates

Quality gates protect the public package, the playground verification surface,
and the agent source material.

## Required Commands

Use `pnpm.cmd` on Windows if PowerShell blocks `pnpm.ps1`.

Fast local gate:

```bash
pnpm.cmd lint
pnpm.cmd audit:static
pnpm.cmd test:scripts
pnpm.cmd test
```

Full gate:

```bash
pnpm.cmd format:check
pnpm.cmd lint
pnpm.cmd audit:static
pnpm.cmd skills:check
pnpm.cmd test:scripts
pnpm.cmd test
pnpm.cmd build
pnpm.cmd build:playground
pnpm.cmd test:ssr
pnpm.cmd test:browser
```

Run focused Playwright projects with `test:e2e`, `test:a11y`,
`test:responsive`, or `test:visual`.

## Test Layers

- Unit tests cover public inputs, host attributes, accessibility wiring,
  keyboard behavior, form integration, disabled/readonly behavior, and providers.
- Script tests cover static audits, skill sync, and deterministic tooling.
- Playground browser tests cover representative pages, overlays, responsive
  overflow, console errors, and SSR/hydration behavior.
- Visual tests are smoke baselines, not a replacement for design review.

## Browser Harness Rules

The coverage map, risk tiers and known gaps live in `docs/browser-test-coverage.md`. Keep it
current when a suite, route or scenario changes.

- Import `test` and `expect` from `tests/e2e/support/fixtures`, never from `@playwright/test`. The
  auto `browserErrors` fixture fails a test at teardown for any console error or uncaught page
  error, including one raised after the last assertion.
- Allow an error only with a `BrowserErrorAllowance` that has a specific message or URL pattern and a
  written reason. Do not filter by broad patterns or catch errors in a test to make it pass.
- Wait for meaningful state with web-first assertions (`gotoReady`, `expect(...).toBeVisible()`).
  Do not use `networkidle`, fixed sleeps, or broad `.first()` selectors.
- Suites run against built output. Each one fails on a missing or stale build
  (`tools/assert-playground-build.mjs`); the SSR scripts also rebuild first and never reuse a server.
- Locale (`en-US`) and timezone (`UTC`) are pinned. Freeze the date with `page.clock.setFixedTime`
  when a test depends on it.
- Behavior, accessibility and responsive projects use production motion. Only the visual project
  reduces motion. Do not add `emulateMedia({ reducedMotion })` to a behavior test.
- Value math and signal state belong in unit tests; focus, hit-testing, geometry, touch and the
  computed accessibility tree belong in the browser.
- Automated axe results are not manual keyboard or screen-reader evidence; record them separately.
- When a harness change is made, prove it can fail: add or keep a case in
  `tests/e2e/harness.spec.ts`, or inject a temporary error and confirm the run goes red before
  removing it.
- A known defect found by a test stays visible as `test.fixme` with its reason and owner, never as a
  deleted or weakened assertion. A retry is not a fix; reproduce with the printed command and keep the
  trace (`pnpm.cmd exec playwright show-trace <trace.zip>`).

## Refactor Rule

Before moving behavior, identify the observable behavior and add a
characterization test when coverage is missing. Keep refactors small and green.

## Hooks

- `pre-commit` runs `lint-staged` on staged files: ESLint and Prettier for TypeScript and
  Angular templates; Stylelint and Prettier for SCSS. It also runs the static and skills
  checks from `.husky/pre-commit`.
- `pre-push` runs the full local gate including browser and SSR checks.
- If a hook fails because of local environment limits, run the same command
  manually and record the exact blocker.
