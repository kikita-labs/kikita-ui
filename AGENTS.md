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

## Component Architecture

- Prefer directive-based primitives on native elements when native semantics already exist, for example `button[kuiButton]`, `input[kuiInput]`, `table[kuiTable]`.
- Use components for composite primitives that need projected children, context, roving keyboard state, or coordinated visual state, for example tabs and segmented controls.
- Use signal inputs/models/queries for public APIs and internal state.
- Template-facing internal members should be `protected`; implementation-only members should be `private`.
- Public primitives must be exported from `projects/ui/src/lib/components/index.ts` and their local component barrel.
- When adding a public primitive, update all of these in the same change unless explicitly deferred:
  - component/directive implementation
  - public barrel exports
  - `projects/ui/src/styles/<primitive>.css`
  - `projects/ui/src/styles/kikita-ui.css`
  - docs page
  - playground page
  - `docs/state-coverage.md`
  - focused unit tests for public behavior

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

Before implementing any new component, check `.local-notes/Ember Spec.dc.html` for visual design and token details.

If the Ember Spec does not have enough information for a component (states, variants, tokens, layout, or visual behavior are unclear or missing), **stop and tell the user**. Do not invent a design. The user will commission Claude Design to produce the missing component spec.

Designed components are added to `.local-notes/` and the Ember Spec is updated before implementation begins.

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
