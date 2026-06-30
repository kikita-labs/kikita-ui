# AGENTS.md

This repository contains Kikita UI, an Angular 22+ UI library and design system.

## Rules

- Angular 22+ only.
- Use signals and Signal Forms-first APIs.
- Use Angular 22 @Service for new service classes. Use @Injectable only when Angular docs or a specific DI pattern require it.
- Angular 22 enables OnPush change detection by default. Do not add `changeDetection: ChangeDetectionStrategy.OnPush` to new components. Use `ChangeDetectionStrategy.Eager` only when intentionally opting out of the default.
- Do not add Angular legacy compatibility unless explicitly requested.
- CSS variables are the public theming contract.
- SCSS is allowed as an authoring/convenience layer, not as the runtime theme API.
- Every public component, directive, provider, service, type, and token must have JSDoc.
- Public UI selectors use the `kui` prefix.
- Prefer native HTML semantics before ARIA.
- Use Angular CDK or Angular Aria for complex accessibility behavior.
- Components must support light/dark theming, responsive layout, disabled/focus/hover/active states, and SSR-safe implementation.
- Do not build components without a real roadmap need.
- Do not copy Taiga UI, Angular Material, Ant Design, PrimeNG, shadcn, Bootstrap, or Tailwind UI visuals/API.
- All git-tracked repository content must be written in English: code comments, docs, examples, ARIA labels, playground text, test names, commit-facing notes, and default UI strings.
- Do not add Cyrillic text or mojibake/garbled encoding to tracked files. Local untracked notes may use any language.

## Component Architecture

- Prefer directive-based primitives on native elements when native semantics already exist, for example `button[kuiButton]`, `input[kuiInput]`, `table[kuiTable]`.
- Use components for composite primitives that need projected children, context, roving keyboard state, or coordinated visual state, for example tabs and segmented controls.
- Form-associated controls with visible label, hint, error, or required state must be documented and demonstrated inside `kui-field`. Put `[formField]` on the native/control element inside `kui-field`; do not move `[formField]` to `kui-field`.
- Do not hand-roll field-level label, hint, error, required marker, or `aria-describedby` wiring around inputs in docs or playground pages. Use `kui-field` shorthand inputs (`label`, `hint`, `hideErrors`, `required`) by default, and use projected `kuiLabel`, `kuiHint`, and `kuiError` only for custom templates. Native option labels for checkbox/radio/switch choices are still appropriate inside the field.
- `kui-field` is responsible for inferring Signal Forms required state and first error message from the projected `[formField]`. Individual input-like directives should stay focused on native control styling/behavior unless they implement an Angular Signal Forms control contract.
- Use signal inputs/models/queries for public APIs and internal state.
- Keep marker directives boolean-like. Visual variants must use an explicit
  `appearance` input, for example `button kuiMenuItem appearance="destructive"`,
  not `kuiMenuItem="destructive"`.
- Template-facing internal members should be `protected`; implementation-only members should be `private`.
- Public primitives must be exported from `projects/ui/src/lib/components/index.ts` and their local component barrel.
- When adding or changing a public primitive, update all of these in the same change unless explicitly deferred:
  - component/directive implementation
  - public barrel exports
  - `projects/ui/src/styles/<primitive>.css`
  - `projects/ui/src/styles/kikita-ui.css`
  - docs page in `docs/<primitive>.md`
  - playground page
  - `docs/state-coverage.md`
  - `docs/component-roadmap.md`
  - focused unit tests for public behavior
- Do not mark a roadmap/state-coverage item as done unless the public implementation, style entrypoint, docs page, playground route, and tests all exist.
- If a primitive is intentionally documented inside another page, make that explicit in `docs/state-coverage.md` and `docs/component-roadmap.md` (for example, `Confirm` is documented in `docs/dialog.md`).

## Overlay Positioning

- Overlay primitives must use Angular CDK or Angular Aria for positioning and interaction behavior.
- With Angular/CDK 22, do not rely on `overlayX: 'center'` or `overlayX: 'end'` for trigger-aligned overlays whose pane size is unknown before first paint. This can misplace panels horizontally.
- Prefer a stable CDK connection with `overlayX: 'start'`, then apply alignment compensation on an inner wrapper (`translateX(-50%)` or `translateX(-100%)`) when center/end alignment is required.
- Test start, center, and end alignment visually in the playground before marking overlay primitives done.
- Verify overlay trigger ARIA after open/close: `aria-controls` must point to an existing panel only while the panel exists.

## Required Files To Update

When implementing or changing a public primitive, update every relevant file in the same change. Do not silently skip any item; if something is not applicable or intentionally deferred, document the reason in `docs/component-roadmap.md` and `docs/state-coverage.md`.

- Full delivery gate: `docs/component-checklist.md`
- Implementation: `projects/ui/src/lib/components/<primitive>/...`
- Local component barrel: `projects/ui/src/lib/components/<primitive>/index.ts`
- Component barrel: `projects/ui/src/lib/components/index.ts`
- Public API: `projects/ui/src/public-api.ts` when the primitive is public outside the package internals
- Runtime styles: `projects/ui/src/styles/<primitive>.css`
- Public style entrypoint: `projects/ui/src/styles/kikita-ui.css`
- Component docs: `docs/<primitive>.md`
- State tracking: `docs/state-coverage.md`
- Roadmap/status tracking: `docs/component-roadmap.md`
- Playground route: `projects/playground/src/app/pages/<primitive>/`
- Playground navigation/routes: `projects/playground/src/app/app.ts` and related route/nav files when a new page is added
- Focused tests: colocated `*.spec.ts` files for the primitive and any changed integration point
- Theme tokens: `projects/ui/src/lib/theme/create-kui-theme.ts` and token interfaces/types when new `--kui-*` variables are introduced
- Local progress notes: `.local-notes/PROGRESS.md` for current-session progress only; this file is ignored and must not be required for package correctness

## Component Delivery Checklist

Before finishing a new public component/directive/service/provider, verify `docs/component-checklist.md`. The short checklist below is the minimum summary, not a replacement for the full gate:

- The matching Claude Design spec exists under `.local-notes/claude-design/design system/`; if it does not exist, stop and ask for the spec.
- Public API has JSDoc on exported components, directives, providers, services, types, and tokens.
- The primitive is exported from its local `index.ts`, `projects/ui/src/lib/components/index.ts`, and `projects/ui/src/public-api.ts` when applicable.
- Runtime styles live in `projects/ui/src/styles/<primitive>.css`, use `@layer kui.components`, and consume only `--kui-*` tokens for design values.
- `projects/ui/src/styles/kikita-ui.css` imports the primitive style file.
- A docs page exists at `docs/<primitive>.md` with import, usage, inputs/outputs, accessibility notes, and style import notes.
- The playground route exists under `projects/playground/src/app/pages/<primitive>/` and demonstrates real states, sizes, themes, disabled/focus/hover/active behavior where relevant.
- `docs/state-coverage.md` lists the route and covered states.
- `docs/component-roadmap.md` reflects the true status and any known gaps.
- Unit tests cover public behavior and important accessibility/state wiring.
- `pnpm build`, `pnpm build:playground`, and relevant tests pass, or the failure is documented with the exact reason.

## Style Architecture

- Keep `projects/ui/src/styles/kikita-ui.css` as the single public style entrypoint for `@kikita-labs/ui/styles`.
- Author real styles in per-layer/per-primitive files under `projects/ui/src/styles/`.
- Import every public primitive style file from `kikita-ui.css`; do not hide required component CSS in playground styles.
- Use CSS `@layer` for Kikita-owned CSS. Current layers are `kui.base` and `kui.components`.
- Component CSS must consume Kikita CSS variables. Do not introduce hardcoded design colors when a `--kui-*` token exists or should exist.
- Playground SCSS may arrange demos, grids, and state simulations, but it must not become the source of component styling.

## Playground Architecture

- Playground routes are lazy standalone page components under `projects/playground/src/app/pages/<name>/`.
- Each playground page should keep its template and SCSS next to the page component: `<name>.page.ts`, `<name>.page.html`, `<name>.page.scss`.
- Keep `projects/playground/src/app/app.scss` for shell/global playground layout only.
- Use `projects/playground/src/app/shared/panel` for repeated board panels.
- Playground is a development/spec board, not the public docs site, but it should still expose real component states and catch obvious responsive/theming defects.

## Package

Current package scope is `@kikita-labs/ui`.

If the GitHub organization later becomes `kikita`, rename the package to `@kikita/ui` before public release.

## Commands

Use Node 24.17.0+.

```bash
pnpm install
pnpm build
pnpm build:playground
pnpm format:check
```

## Source Of Truth

Design AI tools may generate directions and mockups, but source of truth is:

- tokens
- theme generator
- CSS variables
- component APIs
- JSDoc
- docs examples
- tests/visual checks

## Design Escalation

Before implementing any new component, check `.local-notes/claude-design/design system/` for the matching component spec file (e.g. `02 Button.dc.html`, `19 Popover.dc (1).html`).

If a component spec does not exist in `.local-notes/claude-design/design system/` (states, variants, tokens, layout, or visual behavior are unclear or missing), **stop and tell the user**. Do not invent a design. The user will commission Claude Design to produce the missing component spec.

Designed components are added to `.local-notes/claude-design/design system/` before implementation begins.

## Figma And Design Tool Workflow

Figma MCP is available for this project and can be used for design-to-code and code-to-design work.

Current Figma draft:

- `Kikita UI - Design System Draft`
- `https://www.figma.com/design/EJGo75doHj4Z8TvfDzSoDo`

Use Figma for:

- visual boards
- component boards
- design-system reviews
- token inspection
- screenshots
- Figma-to-code implementation context
- final design mirrors after local work stabilizes

Do not treat Figma as the only source of truth. The source of truth remains this repository: tokens, theme generator, CSS variables, component APIs, JSDoc, docs examples, tests, and visual checks.

### Figma Starter Limits

The current Figma account is on Starter and has practical limits that affect agent workflows:

- limited MCP tool calls
- maximum 3 pages per file
- one variable mode only

Because of those limits, do not spend many small MCP calls in Figma. Prefer batching large writes when Figma is required.

If Figma MCP hits limits, switch to local-first workflow:

1. Build the full design system in the Angular playground.
2. Validate tokens/components locally.
3. Use screenshots and browser checks.
4. Mirror the stable result into Figma later with a small number of large MCP calls.

### Figma MCP Safety

When using Figma MCP:

- inspect before writing
- avoid destructive cleanup
- return created or changed node IDs
- batch work carefully
- validate with screenshots/metadata
- stop on errors and read the error before retrying
- do not use Figma MCP for broad exploratory work when local code/playground is enough

### Local/Open Alternatives

If Figma limits block work, evaluate Penpot first.

Penpot is the strongest open-source design-tool candidate for Kikita UI because it supports self-hosting, design tokens, components, variants, inspect/code workflows, plugins, APIs, and MCP.

Other tools may help with diagrams or whiteboards, but they are not primary design-system replacements:

- Excalidraw: excellent whiteboard/sketching, not a structured design-system source of truth.
- tldraw: strong infinite canvas/SDK, useful for custom canvas workflows, not a direct Figma/Penpot replacement for tokens/components.
- diagrams.net/draw.io: good diagramming, not UI design-system authoring.

Preferred hierarchy:

1. Local Angular playground as implementation source of truth.
2. Figma as visual/design review mirror while available.
3. Penpot as the first serious local/self-hosted alternative if Figma limits become annoying.
4. Excalidraw/tldraw/draw.io only for sketches, diagrams, and whiteboard thinking.
