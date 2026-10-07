# Architecture

How the project is laid out and wired together.

- [aliases-and-barrels.md](./aliases-and-barrels.md) — path aliases, barrel `index.ts`
  rules.
- [folder-structure.md](./folder-structure.md) — top-level project layout.
- [routing.md](./routing.md) — route definitions via enum.

- [platform-adapter.md](./platform-adapter.md) — browser-API access boundary for SSR
  safety.

Adding a new architecture doc: only for a genuinely new structural concern. Link it here
immediately.

If the user changes or corrects a structural convention (aliases, folder layout, routing
pattern), update the matching file above in the same change — don't wait for it to come up
again. See `../documentation.md`.

Changing layer direction, state ownership, or the routing/alias strategy itself (not just
documenting it) needs an ADR — see `../decisions/README.md`.

## Automated boundary checks

Two layers, don't rely on discipline alone:

- **From day one**: an ESLint restricted-import rule (`no-restricted-imports` or
  `eslint-plugin-boundaries`) blocking cross-feature imports, `shared`/`core` importing "up"
  into `features/`, and — specifically — any `@angular/*` import inside
  `shared/utilities/**` (see `folder-structure.md`). This is cheap to set up at scaffold
  time and catches violations before review. Shape, using `no-restricted-imports`'
  `patterns` option:

  ```js
  {
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['@app/features/*/*'], message: 'Import from a feature\'s public surface, not its internals.' },
          { group: ['@angular/*'], message: 'shared/utilities must stay framework-agnostic.' } // scoped to shared/utilities/** files only
        ],
      }],
    },
  }
  ```

  The `@angular/*` pattern needs its own config-array entry with `files:
['src/app/shared/utilities/**']` so it doesn't also block legitimate Angular imports
  everywhere else.

- **Once the project grows**: write a small custom `tools/check-boundaries.mjs`-style
  Node script (there's no template for one in this skill — it needs to be written for this
  project's actual folder layout) plus a circular-dependency check (`madge --circular`)
  wired into CI, for boundary logic too nuanced for a single ESLint rule. Not required for
  a fresh project — worth doing once the import graph is complex enough that review alone
  stops catching violations.
