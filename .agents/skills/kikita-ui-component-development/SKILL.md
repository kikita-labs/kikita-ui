---
name: kikita-ui-component-development
description: Develop or update Kikita UI library primitives. Use when creating, changing, testing, documenting, or reviewing a public component, directive, provider, service, token, type, playground page, or component source doc in the kikita-ui repository.
---

# Kikita UI Component Development

Use this skill to deliver a public Kikita UI primitive end to end.

## Start

1. Read `AGENTS.md`.
2. Read `.agents/workflow.md`, `.agents/component-rules.md`,
   `.agents/angular-code-style.md`, `.agents/style-and-design.md`,
   `.agents/ssr-hydration.md`, `.agents/testing-and-quality.md`, and
   `docs/component-checklist.md`.
3. Run `git status --short` and preserve unrelated changes.
4. Use `angularCliKikita.list_projects`, then
   `angularCliKikita.get_best_practices` with the workspace path. If Codex
   returns `Unexpected response type`, treat it as the upstream Codex MCP bug
   tracked in <https://github.com/openai/codex/issues/29002>, use local docs and
   CLI checks as the fallback, and report the MCP blocker explicitly.

## Design Before Code

- For a new component, first create or update `docs/design-brief.md` with the
  functional brief the designer needs.
- Read the matching Claude Design spec under `.local-notes/claude-design/design system/`.
- Stop and report the gap if the design spec is missing or ambiguous.
- Do not invent visuals or clone another UI library's API or styling.

## Implementation

- Prefer native-element directives when native semantics exist.
- Use components only for projected structure, coordinated state, roving focus,
  overlays, or composite behavior.
- Use signal inputs, models, outputs, queries, and computed state.
- Keep public selectors prefixed with `kui`.
- Put runtime CSS in `projects/ui/src/styles/<primitive>.css` and import it from
  `projects/ui/src/styles/kikita-ui.css`.
- Export intended public APIs from the local barrel, component barrel, and root
  public API when applicable.
- Add JSDoc for every public component, directive, provider, service, type,
  token, and public utility.

## Required Surfaces

Update all relevant surfaces in the same change:

- implementation and local tests;
- playground page and navigation route;
- `docs/<primitive>.md`;
- `docs/state-coverage.md`;
- `docs/component-roadmap.md`;
- `CHANGELOG.md` for release-visible changes.

## Verification

Run the focused unit tests first. Before calling the primitive done, run the
quality gate from `.agents/testing-and-quality.md`. For visual or interactive
changes, offer browser or Playwright review and record any unverified gap.
