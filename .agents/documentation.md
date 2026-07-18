# Documentation Maintenance

Documentation is part of the package contract. Agents must keep it synchronized
with shipped implementation, tests, and public typings.

## Where Documentation Lives

- `AGENTS.md`: mandatory entry point and rule router.
- `.agents/*.md`: operating rules for agents.
- `.agents/skills/*`: repo-distributed skills that developers may install into
  local agents.
- `docs/<primitive>.md`: source-of-truth component docs.
- `docs/component-checklist.md`: delivery gate for public primitives.
- `docs/component-roadmap.md`: status, gaps, and deferred work.
- `docs/state-coverage.md`: verified states, routes, accessibility, SSR, and
  browser review evidence.
- `docs/release.md`: package release and publish process.
- `CHANGELOG.md`: release-visible changes.

## Component Docs Contract

Each public primitive doc should include stable headings for:

- usage;
- API;
- accessibility;
- keyboard behavior when relevant;
- form integration when relevant;
- CSS variables or style import notes;
- version or migration notes when behavior changed.

Prefer concise tables for selectors, imports, inputs, outputs, providers,
tokens, CSS hooks, slots, defaults, and unsupported behavior.

## Creating New Docs

When adding a new doc, also update the relevant index/router file:

- `AGENTS.md` for new mandatory agent instructions;
- `.agents/documentation.md` for new documentation categories;
- `docs/component-roadmap.md` and `docs/state-coverage.md` for primitive status;
- the matching skill when a workflow changes.

Never document unreleased source behavior as shipped. If docs repo regeneration
is required, record the package version or blocker.
