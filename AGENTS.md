# AGENTS.md

This repository contains Kikita UI, an Angular 22+ UI library and design system.

This file is the mandatory entry point for every AI agent. Read it first, then
read the linked `.agents/*.md` files required by the task.

## Must Read

Always read:

- `.agents/workflow.md`
- `.agents/git-policy.md`

For Angular or component work, also read:

- `.agents/angular-mcp.md`
- `.agents/component-rules.md`
- `.agents/agent-surface-source.md`
- `.agents/style-and-design.md`
- `docs/component-checklist.md`

For visual, accessibility, release, or publishing work, also read the relevant
tracked docs:

- `docs/accessibility.md`
- `docs/visual-regression.md`
- `docs/release.md`
- `docs/component-roadmap.md`
- `docs/state-coverage.md`
- `CHANGELOG.md`

## Non-Negotiable Rules

- Angular 22+ only.
- Use signals and Signal Forms-first APIs.
- Use Angular 22 `@Service` for new service classes. Use `@Injectable` only when
  Angular docs or a specific DI pattern require it.
- Do not add `changeDetection: ChangeDetectionStrategy.OnPush` to new
  components.
- CSS variables are the public theming contract.
- Every public component, directive, provider, service, type, and token must have
  JSDoc.
- Public UI selectors use the `kui` prefix.
- Prefer native HTML semantics before ARIA.
- Use Angular CDK or Angular Aria for complex accessibility behavior.
- Do not invent component visuals. Use the matching Claude Design spec under
  `.local-notes/claude-design/design system/`; if the spec is missing or unclear,
  stop and report the gap.
- All git-tracked repository content must be English-only.
- Do not add Cyrillic text or mojibake to tracked files.
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
