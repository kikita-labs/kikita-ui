# AGENTS.md

This repository contains Kikita UI, an Angular 22+ UI library and design system.

## Rules

- Angular 22+ only.
- Use signals and Signal Forms-first APIs.
- Use Angular 22 @Service for new service classes. Use @Injectable only when Angular docs or a specific DI pattern require it.
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
