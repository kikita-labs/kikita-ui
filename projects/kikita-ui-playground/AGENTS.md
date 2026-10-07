# AGENTS.md

This repository contains kikita-ui-playground, an Angular application (prefix `app`).

This file is the mandatory entry point for every AI agent. Read it first, then read the
linked `.agents/*.md` files required by the task.

## Must Read

Always read:

- `.agents/README.md` — full map of everything under `.agents/`.
- `.agents/workflow.md`
- `.agents/git-policy.md`
- `.agents/documentation.md`
- `.agents/mcp.md`
- `.agents/testing-and-quality.md`
- `.agents/code-style/README.md`
- `.agents/architecture/README.md`

- `.agents/agent-surface.md`
- `.agents/i18n.md`
- `.agents/accessibility.md`
- `.agents/refactoring.md`

For component or shared-utility work, also read:

- `.agents/shared/README.md`
- `.agents/core/README.md`

For a structural change (layer direction, state ownership, routing or alias strategy),
also read:

- `.agents/decisions/README.md`

For component-entity page design or implementation, also read:

- `.agents/component-page-authoring.md` — agreed contract for component entity pages; follow it when implementing or migrating component routes.

## Non-Negotiable Rules

- Latest stable Angular only. Standalone by default — do not write `standalone: true`, it's
  implicit; do not use NgModules for new code.
- `ChangeDetectionStrategy.OnPush` is the default on current Angular — do not write it
  explicitly on new components. If a component genuinely needs the old default-CD behavior,
  opt out explicitly with `ChangeDetectionStrategy.Eager` and say why in a comment — don't
  silently rely on non-OnPush behavior.
- Signals everywhere: `input()`/`model()`/`output()`/`viewChild()`/`contentChild()`, never
  the legacy `@Input`/`@Output`/`@ViewChild`/`@ContentChild` decorators. New forms use Signal
  Forms (`form()` + `[formField]`); `ngModel` is reserved for genuinely standalone controls,
  and Reactive Forms remain only at intentional legacy or unsupported integration boundaries.
  See `.agents/code-style/component-structure.md` and `.agents/code-style/forms-and-inputs.md`.
- CSS: SCSS. Never hardcode sizes or colors in a component; use the design-token
  variables described in `.agents/code-style/component-structure.md`.
- UI library: @kikita-labs/ui (workspace source). Prefer its primitives over hand-rolled markup, layout-only
  styling, typography via its primitive if it has one. See
  `.agents/code-style/ui-library-usage.md` — always read when a UI library was chosen.
- Routing uses enums for route paths/names, never bare string literals scattered across
  files. See `.agents/architecture/routing.md`.
- Path aliases are mandatory for cross-boundary imports. See
  `.agents/architecture/aliases-and-barrels.md`.
- Every folder with at least one `.ts` file gets a barrel `index.ts`.
- No inline `interface`/`type`/`enum`/`const` declarations meant to be reused — they belong
  in the component's `interfaces/`, `types/`, `enums/`, `constants/` subfolder. See
  `.agents/code-style/component-structure.md`.
- All tracked repository content is English-only, including JSDoc and comments. No
  Cyrillic, no mojibake.
- Never add `Co-authored-by`, `Generated-by`, AI attribution, or assistant attribution
  lines to commit messages. Never claim co-authorship for Claude, Codex, ChatGPT, or any
  other AI tool.
- Do not invent component visuals, library APIs, or behavior. If a spec or installed
  package doesn't cover what you need, stop and report the gap instead of guessing.
- Any change to a shared component, utility, token, or convention must update the matching
  `.agents/` doc in the same change. See `.agents/documentation.md`.

## Source Of Truth

- `.agents/` for conventions and process.
- Installed package versions (`package.json`) for third-party API surface — never assume
  an API exists without checking.
- `.agents/shared/README.md` and `.agents/core/README.md` for what's already built and
  reusable before building something new.
