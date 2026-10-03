# Component Rules

## Core Rules

- Angular 22+ only.
- Use signals and Signal Forms-first APIs.
- Use Angular 22 `@Service` for new service classes. Use `@Injectable` only when
  Angular docs or a specific DI pattern require it.
- Angular 22 enables OnPush change detection by default. Do not add
  `changeDetection: ChangeDetectionStrategy.OnPush` to new components. Use
  `ChangeDetectionStrategy.Eager` only when intentionally opting out of the
  default.
- Do not add Angular legacy compatibility unless explicitly requested.
- Every public component, directive, provider, service, type, and token must have
  JSDoc.
- Read `docs/di-defaults.md` before adding or changing dependency-injection
  defaults. Do not add provider options for every input; add them only for
  repeated design-system decisions.
- Public UI selectors use the `kui` prefix.
- Prefer native HTML semantics before ARIA.
- Use Angular CDK or Angular Aria for complex accessibility behavior.
- Components must support light/dark theming, responsive layout,
  disabled/focus/hover/active states, and SSR-safe implementation.
- Do not build components without a real roadmap need.
- Do not copy Taiga UI, Angular Material, Ant Design, PrimeNG, shadcn,
  Bootstrap, or Tailwind UI visuals/API.

## Architecture

- Prefer directive-based primitives on native elements when native semantics
  already exist, for example `button[kuiButton]`, `input[kuiInput]`,
  `table[kuiTable]`.
- Use components for composite primitives that need projected children, context,
  roving keyboard state, or coordinated visual state, for example tabs and
  segmented controls.
- Form-associated controls with visible label, hint, error, or required state
  must be documented and demonstrated inside `kui-field`.
- Put `[formField]` on the native/control element inside `kui-field`; do not move
  `[formField]` to `kui-field`.
- Do not hand-roll field-level label, hint, error, required marker, or
  `aria-describedby` wiring around inputs in docs or playground pages.
- Use `kui-field` shorthand inputs (`label`, `hint`, `hideErrors`, `required`) by
  default, and use projected `kuiLabel`, `kuiHint`, and `kuiError` only for
  custom templates.
- Native option labels for checkbox/radio/switch choices are still appropriate
  inside the field.
- `kui-field` is responsible for inferring Signal Forms required state and first
  error message from the projected `[formField]`.
- Individual input-like directives should stay focused on native control
  styling/behavior unless they implement an Angular Signal Forms control
  contract.
- Use signal inputs/models/queries for public APIs and internal state.
- Keep marker directives boolean-like. Visual variants must use an explicit
  `appearance` input, for example `button kuiMenuItem appearance="destructive"`,
  not `kuiMenuItem="destructive"`.
- Template-facing internal members should be `protected`; implementation-only
  members should be `private`.
- Public primitives must be exported from `projects/ui/src/lib/components/index.ts`
  and their local component barrel.

## Required Files

When adding or changing a public primitive, update all relevant files in the same
change unless explicitly deferred:

- Full delivery gate: `docs/component-checklist.md`
- Implementation: `projects/ui/src/lib/components/<primitive>/...`
- Layer: classify the new folder in `scripts/architecture-layers.json` (`primitives` or `composites`);
  `pnpm audit:architecture` fails on an unclassified module. See `.agents/imports-and-boundaries.md`.
- Local component barrel: `projects/ui/src/lib/components/<primitive>/index.ts`
- Component barrel: `projects/ui/src/lib/components/index.ts`
- Public API: `projects/ui/src/public-api.ts` when public outside package internals
- Runtime styles: `projects/ui/src/styles/<primitive>.css`
- Public style entrypoint: `projects/ui/src/styles/kikita-ui.css`
- Component docs: `docs/<primitive>.md`
- State tracking: `docs/state-coverage.md`
- Roadmap/status tracking: `docs/component-roadmap.md`
- Agent-surface source facts: keep `docs/<primitive>.md`, public JSDoc,
  roadmap, state coverage, and changelog accurate enough for the docs repo to
  generate Markdown mirrors, `llms.txt`, and MCP data from released package
  behavior
- Matching Kikita UI Playground page and inventory under
  `projects/kikita-ui-playground/src/app/features/playground/pages/<catalog-group>/<primitive>/`,
  plus its focused browser checks and reference screenshots whenever a supported public API,
  default, behavior, or state changes. Reconcile them with the current public contract and source:
  add newly supported cases, remove cases that are no longer supported, and revise changed
  behavior. Do not invent unsupported examples. Add the route to `PlaygroundRoute` and the new
  page's rows to `docs/state-coverage.md`; the static audit fails when a routed page is missing
  there.
- Focused tests: colocated `*.spec.ts` files for the primitive and any changed
  integration point
- Theme tokens: a literal component token goes into the matching file under
  `projects/ui/src/lib/theme/component-tokens/` (foundation, field, content, picker or overlay; the files
  are consecutive slices of one table, so the order of the generated CSS stays stable), a seed-derived
  role into `theme/semantic/` or `theme/palette/`, plus the token interfaces/types, when new
  `--kui-*` variables are introduced. `create-kui-theme.golden.spec.ts` pins the generator output;
  update its hashes and `theme-default.css` (`pnpm generate:theme-css`) in the same commit as a
  deliberate theme change.
- Local progress notes: `.local-notes/PROGRESS.md` for current-session progress
  only; this file is ignored and must not be required for package correctness

Do not mark a roadmap/state-coverage item as done unless the public
implementation, style entrypoint, docs page, playground route, and tests all
exist.

If a primitive is intentionally documented inside another page, make that
explicit in `docs/state-coverage.md` and `docs/component-roadmap.md`.
