# ADR 0002: Public class and file names

Status: accepted, 2026-10-04. Implemented in the 2.0.0 line; `pnpm audit:static` enforces the rules.

## Context

Through 1.x every Angular class carried its construct as a suffix (`KuiSeparatorDirective`,
`KuiTabsComponent`, `KuiToastService`) and every file carried it as an infix
(`kui-separator.directive.ts`). Angular 20 stopped generating both: the CLI emits `app.ts` with
`class App`, the style guide says a file name "should reflect that class name", and Angular 22
documents `@Service` with a suffix-free class. Angular Material (`MatButton`), the CDK
(`CdkMenuItem`), Angular Aria (`Tab`, `Tabs`), PrimeNG (`Tooltip`) and Taiga UI 4 (`TuiButton`) name
classes the same way. The library had 94 public and 16 internal classes with a suffix, three
services that were not yet suffix-free (`KuiToastService`, `KuiDialogService`,
`KuiDrawerService`), provider functions in two shapes (`provideKuiTheme` and `kuiProvideLocale`)
and the Playground already followed the new rule.

## Decision

1. No class carries a `Component`, `Directive` or `Service` suffix. A component or directive class is
   the PascalCase of its selector. Pipes keep `Pipe`.
2. A file is named after its class without a construct infix (`kui-button.ts`, `kui-button.html`,
   `kui-button.spec.ts`; pipes `kui-name-pipe.ts`). Files that are not Angular constructs keep their
   role infix (`.interface`, `.type`, `.util`, `.token`, `.const`) because it carries information and
   moves no public name.
3. Provider functions are `provideKuiX`. The inject-style openers `kuiToast()`, `kuiDialog()`,
   `kuiDrawer()`, `kuiConfirm()` and `kuiMediaViewer()` and the root `provideKikitaUi` keep their
   names. The deprecated `kuiProvide*Options` helpers keep theirs until 3.0.
4. Collisions are resolved by renaming the type that is not the selector's twin
   (`KuiChartLegendItem` data type became `KuiChartLegendEntry`), or by a role name for an internal
   class (`KuiConfirmDialog`, `KuiMediaViewerDialog`, `KuiTreeRow`).
5. The service of an overlay opener lives in the file of its inject function (`KuiToast` in
   `kui-toast.ts`, internal `KuiDialog` and `KuiDrawer` likewise).
6. There are no compatibility aliases. Consumers migrate with `ng update @kikita-labs/ui`, whose
   `rename-symbols-v2` schematic reads `projects/ui/schematics/ng-update/renames.json` and rewrites
   imports, re-exports and uses with the TypeScript parser. The same table is published in
   `docs/migration-v2.md`.
7. CSS class names are not part of this decision. CSS custom properties are the theming contract and a
   class name is stable only where a component page documents it.

## Alternatives rejected

- Deprecated aliases for the old names: doubles the export surface for 74 names, needs a removal
  schedule nothing requires, and the project does not add legacy compatibility unless asked.
- An import alias at the call site for a collision (the Playground rule): fine inside an application,
  but in a public API it moves the cost to every consumer.
- Renaming `.interface.ts`, `.type.ts`, `.util.ts` and `.token.ts` files: the Angular guide only
  retires the infix for constructs, and the rename would touch about 150 files for no rule.
- `injectToast()` style names for the openers: published since 1.x, and `kuiDialog(Component, config)`
  is a factory, not a getter.
- Renaming BEM-style CSS classes (`kui-pagination__page-size-label`): a different namespace, no
  migration tool, and no relation to the TypeScript suffixes.

## Consequences

- 2.0.0 breaks every import of a renamed class; `ng update` fixes them, and the guide lists the rest.
- `pnpm audit:static` fails on a class that ends in `Component`, `Directive` or `Service`, on a file
  with a construct infix and on a file whose name differs from its only Angular class (a `.util.ts`
  module that hosts a service is exempt).
- `lib/public-api-names.spec.ts` fails when an old name is still exported or a new one is missing.
- Renaming or removing a published export later needs a `renames.json` entry, a guide row and a
  changelog entry.
