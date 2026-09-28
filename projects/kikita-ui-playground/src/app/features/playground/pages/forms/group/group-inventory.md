# Group Inventory

## Contract sources

- Public API and composition rules: [`docs/group.md`](../../../../../../../../../docs/group.md).
- Directive inputs, defaults, inherited size, host attributes, and Field-column setup:
  [`kui-group.directive.ts`](../../../../../../../../../projects/ui/src/lib/components/group/kui-group.directive.ts)
  and [`kui-group-orientation.type.ts`](../../../../../../../../../projects/ui/src/lib/components/group/kui-group-orientation.type.ts).
- Size configuration API: [`provide-kikita-ui.ts`](../../../../../../../../../projects/ui/src/lib/providers/provide-kikita-ui.ts),
  [`kikita-ui-options.interface.ts`](../../../../../../../../../projects/ui/src/lib/providers/kikita-ui-options.interface.ts),
  [`kikita-ui-options.token.ts`](../../../../../../../../../projects/ui/src/lib/providers/kikita-ui-options.token.ts),
  and this Playground's [`app.config.ts`](../../../../../../../../../projects/kikita-ui-playground/src/app/app.config.ts).
- Isolated component-scoped token example: [`group-size-scoped-default.ts`](./components/group-sizes/components/group-size-scoped-default/group-size-scoped-default.ts). This example provides `KIKITA_UI_OPTIONS` in its component injector to demonstrate the same size fallback; it does not configure the app-wide `provideKikitaUi()` provider.
- Border merging, orientation, size inheritance, Field subgrid, rounded corners, and invalid
  border stacking: [`group.css`](../../../../../../../../../projects/ui/src/styles/group.css).
- Group behavior tests: [`kui-group.directive.spec.ts`](../../../../../../../../../projects/ui/src/lib/components/group/kui-group.directive.spec.ts).
- Existing complete usage catalogue: [`group.page.html`](../../../../../../../../../projects/playground/src/app/pages/group/group.page.html).

## Inputs, defaults, and composition

| Group input                        | Default and resolution                                                                                                                 | Page coverage                                                                                                                                                                                              |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `orientation: KuiGroupOrientation` | `horizontal`; supported values are `horizontal` and `vertical`.                                                                        | Default horizontal group, plus horizontal and vertical collapsed examples.                                                                                                                                 |
| `size?: KuiSize`                   | Local input, then root `provideKikitaUi({ defaults: { size } })`, then `md`. Supported values are `xs`, `sm`, `md`, and `lg`.          | Explicit four-size matrix, plus an isolated component-scoped `KIKITA_UI_OPTIONS` provider example that resolves omitted Group and Input sizes to `lg`; baseline verifies the no-override fallback to `md`. |
| `collapsed: boolean`               | `false`; presence/boolean values use `booleanAttribute`. Collapsed mode removes the gap and merges supported adjacent control borders. | Baseline without the input; collapsed horizontal and vertical groups and collapsed Field compositions.                                                                                                     |
| `rounded: boolean`                 | `true`; presence/boolean values use `booleanAttribute`. It affects outer corners only when `collapsed` is true.                        | Rounded and square-ended collapsed groups in both orientations.                                                                                                                                            |

There are no Group model inputs, outputs, public methods, validation rules, or intrinsic child
selection behavior. `shape` and `appearance` in the catalogue belong to the child button and icon
button APIs. Group does not force a uniform height; its size sets inherited button/input height
variables, and an explicit child size can override that inherited size.

## Covered contract and behavior

- A minimally configured horizontal, non-collapsed group with native KUI buttons.
- Horizontal and vertical collapsed controls, both rounded and square-ended.
- All Group sizes, using direct `kuiInput` and `kuiIconButton` children.
- Text input + button, mixed icon buttons and text buttons using supported shapes and appearances,
  including every icon-button shape (ghost, outline, solid, soft), and Field + button composition.
- Every Field label/hint/error presence combination (none, each alone, each pair, and all three).
  Each Field stays a direct child so the horizontal three-row grid and Field subgrid are exercised.
- Two equally growing Field columns and an interleaved icon-button / Field / Field / icon-button
  arrangement.
- Explicit invalid Field text with its associated `aria-invalid`, `aria-describedby`, and alert;
  the invalid Field sits between bordered siblings so the collapsed invalid-border seam remains
  visible.
- Search composition uses Signal Forms for the text control. A real Tab/Enter sequence reaches and
  activates the native button; Group itself does not manage focus or keyboard input.
- Server-rendered group semantics/controls, the absence of directive-generated Field column tracks
  in SSR markup, post-hydration Field column setup, runtime locale switching, and no horizontal
  overflow at desktop, tablet, and 320px (`320 × 844`) are asserted by the page E2E spec. The 320px
  section screenshots use a taller viewport (`320 × 2048`) so every full section fits within the
  Playground's internally scrolling workspace.

## Semantics, edge cases, and omissions

- `KuiGroupDirective` only adds `kui-group` and data attributes/style state. It does not add a
  `role`, accessible name, ARIA wiring, roving tab stop, or keyboard behavior. Examples add a
  labelled `role="group"` to the actual related controls; Field keeps its own label, hint, error,
  and control associations.
- Validation belongs to `kui-field` and Signal Forms, not Group. The catalogue uses Field's
  explicit error input to show the real invalid border and ARIA state without attributing validation
  to Group.
- Horizontal Fields use shared label/control/message rows and subgrid; vertical groups intentionally
  keep Field's independent row sizing because cross-sibling row alignment is inapplicable there.
- The supported collapse selectors target direct KUI buttons, icon buttons, and inputs; Field
  composition reaches the Field's projected input. Arbitrary wrappers do not receive collapsed
  border merging or corner restoration.
- Explicit child-size conflicts, dynamic addition/removal of Field children, arbitrary child
  wrappers, and extra Group density/shape/appearance values are omitted. A child-size conflict is a
  consumer choice with documented top-alignment behavior. Dynamic Field columns are not established:
  the directive scans its direct DOM children once after render and does not subscribe to later
  structural changes, so the page keeps its compositions static. Arbitrary wrappers do not match
  the shipped collapsed-border selectors, and Group exposes no density, shape, or appearance inputs.
- `--kui-group-gap` (default `8px`) and `--kui-group-collapsed-gap` (default `-1px`) are consumed by
  `group.css`, but are not documented in `docs/group.md` or `docs/tokens.md`; this page does not
  invent new CSS overrides to demonstrate them.

## Self-review checklist

- [x] The route presents Group as a compact catalogue with a minimally configured default and concise labels.
- [x] Every public input/default and meaningful supported composition maps to an example; unsupported behavior and source gaps are recorded.
- [x] Size, orientation, collapsed borders, rounded corners, Field combinations, invalid seams, multiple Fields, keyboard use, and responsive behavior are covered without changing Group visuals.
- [x] Page text and accessible names use the `group` Transloco scope; the English and Russian catalogues have matching keys.
- [x] Playwright scenarios use named accessible groups, real keyboard interaction, server-rendered markup, post-hydration assertions, and deterministic viewport sizes. The E2E records the supported SSR behavior: Field groups have no directive-generated inline column list in server markup; after hydration, the one-field, two-field, and interleaved cases receive their expected explicit tracks.
- [x] Local Prettier, locale key parity, and template-key resolution checks passed.
- [x] Parent Forms route, translation scope, and shared SSR route registration are integrated.
- [x] Playground build and Group browser suite pass; fresh desktop and full-section 320px screenshots are generated and visually inspected. The separate overflow assertion covers desktop, tablet, and `320 × 844` viewports.
- [x] Independent review of implementation, accessibility, and screenshot evidence is complete.
- [ ] The page-specific files have been committed separately after verification.
