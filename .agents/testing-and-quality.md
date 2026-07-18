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

## Refactor Rule

Before moving behavior, identify the observable behavior and add a
characterization test when coverage is missing. Keep refactors small and green.

## Hooks

- `pre-commit` runs cheap checks only.
- `pre-push` runs the full local gate including browser and SSR checks.
- If a hook fails because of local environment limits, run the same command
  manually and record the exact blocker.
