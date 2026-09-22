# Path Aliases & Barrels

## Aliases

- Every top-level source area gets a `tsconfig` path alias (`@app/*`, `@shared/*`,
  `@core/*`, ...). Configure in `tsconfig.json` `compilerOptions.paths`. Don't also set
  `baseUrl` for this — implicit `baseUrl`-relative module resolution without explicit
  `paths` is deprecated in current TypeScript; `paths` entries alone (each mapped from the
  project root) are enough and don't hit the deprecation warning.
- Use an alias for any import that crosses a folder boundary. Relative imports (`./`,
  `../`) are only for files inside the same feature/component folder.
- Never write `../../../` chains — if an import needs that, it's crossing a boundary and
  needs an alias instead.

## Barrels

- Every folder that contains at least one `.ts` file gets a barrel `index.ts`, including
  component subfolders (`interfaces/`, `types/`, `constants/`, `enums/`, `helpers/`,
  `services/`, `tokens/`) — except a feature root (`features/<feature-name>/`). Nothing outside that
  feature imports its files directly (see `folder-structure.md`), and `app.routes.ts` /
  a parent's `<feature-name>.routes.ts` load the routes file itself via `loadChildren`,
  not through a barrel — so a feature-root `index.ts` would have no consumer.
- A barrel exports only what's meant for outside consumers — explicit named exports, never
  `export *`. Type-only exports use `export type { Foo }`.
- A barrel must not import from its own parent folder.
- Import from the barrel path, never reach past it into a sibling's internals.
- No import cycles between barrels — if `shared/a` and `shared/b` end up importing each
  other, one of them owns something the other actually needs and should be split out.

## Review Checklist

- [ ] No `../../../`-style relative chains crossing a folder boundary.
- [ ] Every `.ts`-containing folder has an `index.ts`, except a feature root
      (`features/<feature-name>/`).
- [ ] Barrels use explicit named exports; type-only exports use `export type`.
- [ ] No import cycle introduced between barrels or features.
