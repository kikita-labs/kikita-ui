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

## Deprecations and Removal Plans

Treat any public selector, input, output, model, provider option, CSS custom
property, token, type, or export that remains only for compatibility as
deprecated immediately.

For every deprecation:

1. Mark the symbol with `@deprecated` JSDoc. For generated token-map entries
   that cannot carry JSDoc, add an adjacent English source comment.
2. Document the replacement, the reason for the deprecation, and the behavior
   that remains available during the compatibility window.
3. State the planned removal release explicitly, normally the next major
   version (for example, `deprecated in 1.x; planned for removal in v2`).
4. Add migration notes to the matching component or token docs and add a
   user-visible entry to `CHANGELOG.md`.
5. Keep compatibility output and focused regression coverage until the
   removal release. Do not list compatibility-only names as active tokens.

If the replacement or removal release is unknown, stop and resolve that gap
before documenting the deprecation. Do not leave a compatibility-only API
implicitly deprecated or silently remove it.

## Creating New Docs

When adding a new doc, also update the relevant index/router file:

- `AGENTS.md` for new mandatory agent instructions;
- `.agents/documentation.md` for new documentation categories;
- `docs/component-roadmap.md` and `docs/state-coverage.md` for primitive status;
- the matching skill when a workflow changes.

Never document unreleased source behavior as shipped. If docs repo regeneration
is required, record the package version or blocker.
