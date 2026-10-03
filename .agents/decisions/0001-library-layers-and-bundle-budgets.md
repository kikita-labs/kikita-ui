# ADR 0001: Library layers, decoupled controls and bundle budgets

Status: accepted, 2026-10-04. Implemented in slices; the audits in `scripts/` enforce each rule as its slice lands.

## Context

The library ships as one entry point (`@kikita-labs/ui`). A per-export measurement on 2026-10-04 (every
runtime export imported alone into an empty Angular application, built with the application builder,
`optimization: true`, bytes of library code read from the build stats) showed that tree-shaking itself
works, but coupling between primitives defeats it:

| Import                                                                               | Library code in the bundle |
| ------------------------------------------------------------------------------------ | -------------------------- |
| `kuiBadge`                                                                           | 5 kB                       |
| `kuiButton`                                                                          | 26 kB                      |
| `kuiInput`, `kuiCheckbox`, `kuiRadio`, `kuiSwitch`, `kuiTextarea`, `kui-field`       | 73 kB                      |
| `kuiSelect`, `kuiSlider`, `kuiNumberInput`, `kuiCombobox`, OTP, Date and Time Picker | 79-86 kB                   |
| `kui-pagination`                                                                     | 99 kB                      |
| `provideKikitaUi`                                                                    | 36 kB                      |

Causes found in the source:

- Fourteen control files inject the `KuiFieldComponent` class. Field holds `contentChild` references to
  Dropdown, Calendar and Time Picker Panel, so every control carries the form-field closure.
- `KuiButtonDirective` creates `KuiIconComponent` for `iconStart` and `iconEnd`, so every Button user
  pays for the icon renderer (about 11 kB).
- `KuiI18n` imports the whole English dictionary (153 messages), so a Loader costs 14.5 kB for 0.6 kB
  of own code.
- `provideKikitaUi` runs the runtime theme generator (about 19 kB) even for the default theme that
  `theme-default.css` already provides.
- Module-level initialisers (`new Set([...])`, `new WeakMap()`, `createKuiLucideResolver()`) stay in every
  bundle because bundlers keep top-level initialisers that are not annotated as pure.
- Primitives reach into each other through class names (`.kui-calendar-day`, `[data-kui-range]`,
  `.kui-dialog-close`) instead of typed contracts.
- Module cycles exist: `field <-> input <-> time-picker`, `tooltip <-> utils`,
  `i18n <-> providers <-> components/icon`.
- Calendar and Calendar Range share about 85-90% of their code; the four charts share about twenty members.

## Decision

1. **Keep one entry point.** No secondary entry points: the measurement shows the single flat bundle
   tree-shakes (Badge 5 kB, Button 26 kB), and secondary entries forbid the cycles that exist today.
2. **Layers, dependencies point down only (enforced as rules in `scripts/architecture-layers.json`, not as folders):** `foundation` (pure functions) -> `core` (defaults, i18n,
   theme generator, overlay helpers) -> `primitives` (leaf components) -> `composites` (field, select,
   combobox, pickers, calendar, chart) -> `root` (`provideKikitaUi` and other composition-root
   functions). `core` may import component options types type-only (the defaults registry). Type-only
   edges are not counted.
3. **No module cycles.**
4. **Controls do not inject the Field class.** Controls implement a `KuiFieldControl` contract and
   register through a token; descendants inject a `KUI_FIELD` token. Field does not reference Calendar,
   Time Picker Panel or Dropdown. This is the Angular Material pattern (`MAT_FORM_FIELD`,
   `MatFormFieldControl`).
5. **Composition, not base classes.** Shared behaviour is a plain object or helper created in the
   injection context (for example a chart session), or `hostDirectives`. No generic base class.
6. **Folder rule.** A primitive stays flat while it has under about 12 files and one public symbol
   group. A family with several public components gets a `core/` folder for shared internals plus one
   folder per public sub-primitive. Never create subfolders by file type inside a primitive.
7. **Calendar and Calendar Range share one engine** with a `single` / `range` selection strategy.
8. **Templates** longer than 3 lines live in an external `.html` file beside the component.
9. **CSS source lives beside its component; delivery stays one ordered `kikita-ui.css`** inside
   `@layer kui.components`, usable without Angular. `kikita-ui.css` imports
   `../lib/<path>/kui-<name>.css`; `ng-package.json` mirrors `lib/**/*.css` into `dist/ui/lib/` so the
   same relative paths resolve in the repository and in the package. Per-component CSS delivery is
   not built: twelve stylesheets depend on other components' classes, and lazily injected styles would
   make the cascade order inside a layer depend on first use.
10. **Shared stylesheets stay in `styles/`:** `base`, `cdk-overlay`, `density`, `glyph`, `forced-colors`,
    `scrollbar`, `selection`, `listbox`, `theme-default`.
11. **Bundle budgets are a gate** (`pnpm audit:bundle`, `scripts/bundle-budgets.json`): a ratcheting
    `limitBytes` per export plus a `targetBytes` goal; the metric is Kikita code in `main.js` and the
    chunks it imports statically. Targets: Input-like controls at most 30 kB,
    Select, Slider, Number Input, OTP, Combobox, Pagination and Color Input at most 45 kB, Date and Time
    Picker at most 55 kB, Button at most 12 kB, Loader at most 8 kB, `provideKikitaUi` at most 14 kB,
    Tooltip, Dropdown and Icon at most 8 kB.
12. **Message defaults stay one aggregate pack.** Per-group registration was evaluated and rejected:
    `KuiI18n.messages` is a documented signal of the complete map, and the real saving for an
    application is about 3 kB.
13. **The runtime theme stays.** `provideKikitaUi` keeps generating and installing the layered theme
    (the server HTML carries it, and `provideKikitaUi({ theme })` is the documented way to set seeds).
    Removing the generator from the default path was evaluated and rejected: lazy loading does not
    keep a public export out of the initial bundle, and the alternatives need a secondary entry point or
    an API break.
14. **Button and Icon stay as they are.** Moving `iconStart` and `iconEnd` to projected `kui-icon` was
    evaluated and rejected: the icon renderer is shared by about 25 components, so applications save
    nothing, and two public inputs would break.
15. **No top-level side effects** in library modules (lazy initialisation or a pure annotation), enforced
    by a static audit rule.
16. **No class-name contracts between primitives;** typed contracts owned by the lower layer.
17. **Date maths lives in `foundation`;** the tooltip overlay helper moves into the tooltip primitive.
18. **Angular Aria is not adopted in this work.** Replacing the 18 hand-written arrow-key
    implementations changes behaviour and adds a peer dependency to a package marked "New"; only
    provably identical logic moves into `core`. Adoption is evaluated after v2.
19. **Enforcement is two scripts, not a new dependency.** `pnpm audit:architecture` (module cycles and
    group direction with a shrinking baseline) and `pnpm audit:bundle`. dependency-cruiser was rejected:
    its `collapse` option only affects reporters, so it cannot validate cycles between folders.
20. **File names do not change in this work;** the public naming migration renames class and file names
    once, later.

## Consequences

- Controls lose their dependency on the Field class; `Pagination` and the pickers shrink with them.
- A missed budget needs a written reason in the commit; a baseline entry may only be removed, never
  added to hide a new dependency.
- Public API stays identical except where decision 14 applies.
- Each slice is committed and can be reverted on its own.

## Outcome of the bundle work (2026-10-04)

Measured with `pnpm audit:bundle` on a fresh build (library code reached from `main.js` and its static
chunks, one export imported alone):

| Export                                                            | Before            | After                     | Target                                                        |
| ----------------------------------------------------------------- | ----------------- | ------------------------- | ------------------------------------------------------------- |
| `kuiInput`, `kuiCheckbox`, `kuiRadio`, `kuiSwitch`, `kuiTextarea` | 73 kB             | 3 kB                      | 30 kB, met                                                    |
| `kuiSelect`                                                       | 86 kB             | 33 kB                     | 45 kB, met                                                    |
| `kuiSlider`, `kuiNumberInput`, `kuiCombobox`                      | 80-84 kB          | 14-26 kB                  | 45 kB, met                                                    |
| Date Picker, Time Picker                                          | 82-85 kB          | 30-32 kB                  | 55 kB, met                                                    |
| Color Input                                                       | 95 kB             | 44 kB                     | 45 kB, met                                                    |
| Tooltip                                                           | 10 kB             | 7.5 kB                    | 8 kB, met                                                     |
| `kui-pagination`                                                  | 99 kB             | 71 kB                     | 45 kB, missed (a real `kuiSelect` and `kui-field` dependency) |
| Dropdown                                                          | 12 kB             | 8.8 kB                    | 8 kB, missed (own overlay code)                               |
| Button, Icon Button, Icon, Loader                                 | 26, 25, 12, 15 kB | 24.8, 24.2, 10.2, 12.1 kB | 12, 12, 8, 8 kB, missed                                       |
| `provideKikitaUi`                                                 | 36 kB             | 35.6 kB                   | 14 kB, missed                                                 |

The misses come from the shared icon renderer, the i18n service with its English pack and the runtime
theme generator, which decisions 12 to 14 above explain.

## Alternatives rejected

- Secondary entry points per primitive (PrimeNG, NG-ZORRO, Taiga): the single entry already
  tree-shakes; entries forbid cycles and slow builds.
- Per-component CSS delivery (Angular Material, Taiga): about 50 kB gzip saved in a typical case, but
  it breaks the documented single stylesheet and a deterministic order.
- Base classes for charts and calendars: the project rule prefers composition and Angular recommends it.
- Subfolders by file type inside every primitive: no surveyed library does this.
- Adopting `@angular/aria` now: behaviour change, new peer dependency, "New" status.
- Keeping the runtime theme generator for the default theme: about 19 kB in every application for a
  stylesheet that already ships.

## Evidence

- Angular Material: [button](https://github.com/angular/components/tree/main/src/material/button),
  [datepicker](https://github.com/angular/components/tree/main/src/material/datepicker) (selection model and
  range strategy), [form-field](https://raw.githubusercontent.com/angular/components/main/src/material/form-field/form-field.ts)
  (`MAT_FORM_FIELD`), [core](https://github.com/angular/components/tree/main/src/material/core),
  [circular dependency test](https://github.com/angular/components/blob/main/src/circular-deps-test.conf.cjs).
- Angular Aria [private patterns](https://github.com/angular/components/tree/main/src/aria/private) and its
  [pattern rules](https://github.com/angular/components/blob/main/src/aria/private/ui-pattern-rules.md).
- [Angular style guide](https://angular.dev/style-guide) and
  [directive composition](https://angular.dev/guide/directives/directive-composition-api).
- [Taiga charts](https://github.com/taiga-family/taiga-ui/tree/main/projects/addon-charts/components),
  [PrimeNG tabs](https://github.com/primefaces/primeng/tree/master/packages/primeng/src/tabs),
  [NG-ZORRO tabs](https://github.com/NG-ZORRO/ng-zorro-antd/tree/master/components/tabs).
- [esbuild tree shaking](https://esbuild.github.io/api/#tree-shaking) (top-level initialisers are kept).
- [dependency-cruiser options](https://github.com/sverweij/dependency-cruiser/blob/main/doc/options-reference.md)
  (`collapse` is for reporters).

## Slices

0. This ADR, `audit:architecture`, `audit:bundle`, the CSS packaging spike (done: a moved stylesheet
   bundles byte-for-byte identically from the repository and from the packed package).
1. Break the cycles; Field contract and token; shared-core weight (Icon, i18n, root provider, side
   effects, class-name contracts, date maths).
2. Layers as audited rules, not folders: `scripts/architecture-layers.json` classifies every module, the
   baseline is empty (done 2026-10-04). A physical move into `primitives/` and `composites/` folders
   was rejected: none of the surveyed libraries separates components that way, and it would rewrite
   hundreds of paths in docs and Playground inventories for no extra guarantee.
3. Theme split with exact output equivalence.
4. Calendar engine.
5. Chart session and per-type folders.
6. Remaining large primitives.
7. External templates.
8. CSS beside components.
