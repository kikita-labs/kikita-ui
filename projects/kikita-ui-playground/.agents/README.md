# .agents

Documentation index. `AGENTS.md` at the repo root tells an agent what's mandatory to read
for a given task; this file is the flat map of everything that exists under `.agents/`.

## Root docs

- [workflow.md](./workflow.md) — task sequence to follow.
- [git-policy.md](./git-policy.md) — commit/push rules and authority.
- [documentation.md](./documentation.md) — how to write and maintain these docs.
- [mcp.md](./mcp.md) — installed MCP servers, Claude vs Codex config.
- [testing-and-quality.md](./testing-and-quality.md) — lint/format/test gate.
- [refactoring.md](./refactoring.md) — refactor policy.
- [progress.md](./progress.md) — dated status log.
- [accessibility.md](./accessibility.md) — a11y and responsive rules.
- [component-page-authoring.md](./component-page-authoring.md) — agreed contract for component entity pages and reusable example groups.

- [agent-surface.md](./agent-surface.md) — JSDoc requirements.

- [i18n.md](./i18n.md) — i18n approach and rules.
- [i18n-json-architecture.md](./i18n-json-architecture.md) — JSON catalogue structure,
  feature scopes, loading, and validation.

## Subfolders

- [code-style/](./code-style/README.md) — formatting, imports, component structure,
  RxJS/signals, CSS layers.
- [architecture/](./architecture/README.md) — aliases, barrels, folder layout, routing,
  SSR platform boundary.
- [shared/](./shared/README.md) — registry of reusable `ui/` (components, directives,
  pipes) and `utilities/` (framework-agnostic helpers).
- [core/](./core/README.md) — registry of app-wide singletons (services/guards/
  interceptors).
- [decisions/](./decisions/README.md) — ADRs for hard-to-reverse architectural changes.

Read `documentation.md` before adding, moving, or restructuring anything here. It's the
master rulebook for _when_ a doc update is mandatory — e.g. a new reusable component/pipe/
mixin/service goes in `shared/` or `core/`, and a user-corrected convention goes in
`code-style/` or `architecture/` — right away, not as a follow-up.
