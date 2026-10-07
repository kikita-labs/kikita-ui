# AGENTS.md

This repository contains Kikita UI, an Angular 22+ UI library and design system.

This file is the mandatory entry point for every AI agent. Read it first, then
read the linked `.agents/*.md` files required by the task.

## Must Read

Always read:

- `.agents/workflow.md`
- `.agents/git-policy.md`
- `.agents/architecture.md`
- `.agents/angular-code-style.md`
- `.agents/imports-and-boundaries.md`
- `.agents/testing-and-quality.md`
- `.agents/documentation.md`
- `.agents/skills.md`
- `.agents/refactoring.md`

For Angular or component work, also read:

- `.agents/angular-mcp.md`
- `.agents/component-rules.md`
- `.agents/agent-surface-source.md`
- `.agents/style-and-design.md`
- `.agents/ssr-hydration.md`
- `docs/component-checklist.md`

For visual, accessibility, release, or publishing work, also read:

- `.agents/release-and-publishing.md`
- `docs/accessibility.md`
- `docs/visual-regression.md`
- `docs/release.md`
- `docs/component-roadmap.md`
- `docs/state-coverage.md`
- `CHANGELOG.md`

For work in `projects/kikita-ui-playground/`, also read:

- `projects/kikita-ui-playground/AGENTS.md`

That application owns additional rules for its Angular shell, runtime i18n,
SSR verification, and its own `.agents/` documentation tree.

## Non-Negotiable Rules

- Angular 22+ only.
- Use signals and Signal Forms-first APIs.
- Use Angular 22 `@Service` for new service classes. Use `@Injectable` only when
  Angular docs or a specific DI pattern require it.
- Name Angular classes for what they are: no `Component`, `Directive` or `Service` suffix
  (`KuiButton`, `KuiTabs`, `KuiToast`), and name files after the class without a construct infix
  (`kui-button.ts`, `kui-button.html`, `kui-button.spec.ts`). A pipe keeps `Pipe` and a `-pipe.ts` file.
  Provider functions are `provideX`. `pnpm audit:static` enforces this; see
  `.agents/angular-code-style.md`.
- Do not add `changeDetection: ChangeDetectionStrategy.OnPush` to new
  components.
- CSS variables are the public theming contract.
- Every public component, directive, provider, service, type, and token must have
  JSDoc.
- When deprecating a public API or token, mark it explicitly, document its
  replacement and compatibility window, and state the planned removal release
  in the matching docs and `CHANGELOG.md`. Compatibility-only names must never
  remain undocumented.
- Public UI selectors use the `kui` prefix.
- Prefer native HTML semantics before ARIA.
- Use Angular CDK or Angular Aria for complex accessibility behavior.
- Keep repo-distributed skills under `.agents/skills/`; local user skill
  installs are never overwritten without explicit consent.
- Do not invent component visuals. Follow `docs/design-provenance.md` and the
  matching approved component design record. If the required design or approval
  is missing or unclear, stop the affected visual work and report the gap.
- All git-tracked repository content must be English-only, except locale resource catalogues
  under `projects/kikita-ui-playground/public/i18n/`, which use the locale's native language.
- Do not add Cyrillic text or mojibake to tracked files outside approved locale catalogues.
- Never add `Co-authored-by`, `Generated-by`, AI attribution, or assistant
  attribution lines to commit messages.
- Do not claim co-authorship for Claude, Codex, ChatGPT, or any other AI tool.

## Source Of Truth

Design tools may generate directions and mockups, but the implementation source
of truth is this repository:

- tokens
- theme generator
- CSS variables
- component APIs
- JSDoc
- docs examples
- tests and visual checks
