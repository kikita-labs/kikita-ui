# Imports And Boundaries

Kikita UI is a library package first. Imports must preserve public boundaries and
make it clear what is internal.

## Library Imports

- Library implementation files may use relative imports inside
  `projects/ui/src/lib`.
- Library implementation files must not import from `@kikita-labs/ui` or
  `@kikita-labs/ui/*`. That package barrel is for consumers and playground
  package-facing checks, not for library internals.
- Playground pages should import public primitives from `@kikita-labs/ui` to
  exercise the package-facing API through the workspace alias.
- Do not import private component implementation files from unrelated primitive
  folders.
- Shared internal helpers belong under `projects/ui/src/lib/utils`, `theme`,
  `tokens`, `providers`, or `types` when they are not primitive-specific.

## Barrels

- Each primitive owns a local `index.ts`.
- `projects/ui/src/lib/components/index.ts` exports public primitives.
- `projects/ui/src/public-api.ts` exports the package public surface.
- Do not export test helpers, playground-only code, private adapters, or
  temporary migration paths from public barrels.

## Styles

- Component runtime CSS is imported only through
  `projects/ui/src/styles/kikita-ui.css`.
- Playground SCSS may arrange demos but must not become the implementation
  source for a primitive.

## Dependency Direction

```text
public-api -> components/providers/theme/tokens/types
components -> local primitive files + shared library helpers
playground -> @kikita-labs/ui + playground shared UI
docs -> source-of-truth Markdown, not runtime code
```

Do not make the library depend on the playground or docs repo.

## Layers And The Module Graph Audit

Library code is arranged in layers, lowest first. A module may import its own layer and the layers
below it, never a higher one:

```text
foundation   foundation, types, utils            pure helpers
core         i18n, providers, theme, tokens      engines without UI
primitives   components/<leaf primitives>        buttons, inputs, field, dropdown, calendar, ...
composites   components/<composed components>    select, combobox, pickers, chart, pagination, ...
root         root                                provideKikitaUi and other composition-root code
```

`pnpm audit:architecture` reads the import graph of `projects/ui/src/lib` (type-only imports and files
that export only types are ignored; barrels are not consumers) and fails on:

- a module cycle (a module is `components/<name>` or one of the other top-level folders);
- a runtime import from a lower layer to a higher one, for example a primitive importing a composite;
- a module that is not classified, or a classification of a module that no longer exists.

`scripts/architecture-layers.json` is the classification. Add every new component folder to it:
`primitives` for a building block that depends only on other primitives, `composites` for a component
that assembles several primitives or other composites. `scripts/architecture-baseline.json` lists
cycles and violations that are allowed to exist; it is empty and must stay empty, so fix a new
dependency instead of recording it. Layers are rules, not folders: component folders stay flat under
`components/`, as in Angular Material and the other surveyed libraries. The reasons and the measured
effects are in [ADR 0001](decisions/0001-library-layers-and-bundle-budgets.md).

Controls and parts talk to `kui-field` through its contract (`KUI_FIELD` and the part keys in
`components/field/kui-field-host.token.ts`), never through the `KuiFieldComponent` class, so a control
does not pull the field and the pickers it can host into an application bundle.
