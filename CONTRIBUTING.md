# Contributing to Kikita UI

Thanks for helping improve Kikita UI. This file is the short version; the full
contract for the repository lives in [AGENTS.md](AGENTS.md) and the `.agents/`
folder, and applies to human contributors as well as coding agents.

## Setup

Use Node 24.17.0+ and pnpm.

```bash
pnpm install
pnpm start
```

`pnpm start` serves the internal playground app.

## Before you open a pull request

```bash
pnpm format:check
pnpm lint
pnpm audit:static
pnpm test
pnpm build
```

Behavior and visual suites are described in
[docs/browser-test-coverage.md](docs/browser-test-coverage.md) and
[docs/visual-regression.md](docs/visual-regression.md). Visual baselines are
generated only in Docker (`pnpm test:visual`), never on the host.

## Rules that are easy to miss

- Angular 22+ only. Use signals and Signal Forms-first APIs.
- Public selectors use the `kui` prefix. Classes are named for what they are,
  with no `Component`, `Directive` or `Service` suffix (`KuiButton`, not
  `KuiButtonComponent`).
- Every public component, directive, provider, service, type and token needs JSDoc.
- CSS variables are the public theming contract.
- Prefer native HTML semantics before ARIA.
- Do not invent component visuals. Follow [docs/design-provenance.md](docs/design-provenance.md).
- All tracked content is English-only, except the locale catalogues under
  `projects/kikita-ui-playground/public/i18n/`.
- Add an entry under `## [Unreleased]` in [CHANGELOG.md](CHANGELOG.md) when a change
  touches public API or behavior, or fixes a user-visible bug.

## Commits

Keep messages concise, in English, and focused on the change. Conventional
Commit prefixes (`feat`, `fix`, `docs`, `test`, `refactor`, `chore`) are used in
this repository.

## Component work

New or changed components follow [docs/component-checklist.md](docs/component-checklist.md).
