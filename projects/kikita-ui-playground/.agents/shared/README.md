# Shared

Registry of everything in `src/app/shared/` meant to be reused across features, split by
dependency shape:

- `shared/ui/` — components, directives, pipes. Angular-decorated, template-facing.
- `shared/utilities/` — plain functions/classes. Zero `@angular/*` imports, ever.

A `shared/utilities/*.helper.ts` file is a flat file, not a component with `constants/`/
`interfaces/` sibling subfolders — that split (`../code-style/component-structure.md`)
applies to component/feature folders, not here. A lookup table or constant private to one
helper file (not exported) stays inline in that file. Only pull a constant out into its own
file if it's exported for reuse by more than the one helper that defines it.

(SCSS mixins, if SCSS was chosen, live in `styles/mixins/` — not here, and not registered
in this table. See `../code-style/css-architecture.md`.)

Check this file before building something new; reuse before you build.

## Registry

| Name         | Kind | Path | Doc | Summary |
| ------------ | ---- | ---- | --- | ------- |
| _(none yet)_ |      |      |     |         |

Kind is one of: `component`, `directive`, `pipe`, `utility`.

## Adding an entry

1. Build it under `src/app/shared/ui/` (component/directive/pipe, following
   `../code-style/component-structure.md`) or `src/app/shared/utilities/` (plain function —
   verify it genuinely has no Angular import before placing it here).
2. Add a row to the table above.
3. If it's a component, directive, or anything with a non-trivial API surface, create
   `.agents/shared/<name>.md` describing: what it's for, its public API (inputs/outputs/
   params), and when to use it vs. building something new. Link it in the Doc column.
4. If it's a small utility or pipe with no meaningful API surface, the table row alone is
   enough — no separate file required.

This applies every time a shared piece is added, changed, or removed — see
`../documentation.md`.

## Default Precedence

When a shared component has a configurable default (a size, a variant, a behavior), design
resolution in this order, most specific wins:

1. An explicit input on the component instance.
2. A scoped provider on an ancestor component (`providers: [...]` on a container).
3. A field/form-level provider (for form-field-adjacent defaults).
4. A root-level provider (`providedIn: 'root'`, app-wide default).
5. The component's own hardcoded default.

Only introduce an injection token for a default that's actually repeated across call sites
— don't add a provider token speculatively for something only one input ever needs; that's
what the plain input default is for.

## Review Checklist

- [ ] Table has no stale entries (removed) or missing entries (new shared piece not
      listed).
- [ ] Each non-trivial entry has its own doc file, linked from the table.
- [ ] `Kind` column filled in for every row.
- [ ] Component/directive/pipe under `ui/`, utility under `utilities/` — not mixed, and
      nothing under `utilities/` imports `@angular/*`.
