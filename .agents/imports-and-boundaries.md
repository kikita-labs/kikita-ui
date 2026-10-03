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

## Module Graph Audit

`pnpm audit:architecture` enforces two rules on `projects/ui/src/lib` today:

- No module cycles. A module is `components/<primitive>` or one of `types`, `utils`, `i18n`,
  `providers`, `theme`, `tokens`.
- No runtime import from a lower group to a higher one. Groups, lowest first: `types` and `utils`;
  `i18n`, `providers`, `theme`, `tokens`; `components`.

Type-only imports do not count. `scripts/architecture-baseline.json` records the cycles and violations
that exist today and are being removed under
[ADR 0001](decisions/0001-library-layers-and-bundle-budgets.md); never add an entry to hide a new
dependency, fix the dependency instead. The target layering in that ADR is enforced step by step as
its slices land.
