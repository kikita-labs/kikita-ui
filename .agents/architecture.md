# Kikita UI Architecture

Kikita UI is an Angular 22+ UI library and design system. The library package is
the implementation source of truth; the playground is the internal verification
surface; the sibling `kikita-ui-docs` repository is the external consumer proof.

## Goals

- Ship accessible, themeable, SSR-safe Angular primitives for product UIs.
- Keep public APIs small, typed, documented, and stable.
- Make CSS custom properties the public theming contract.
- Keep component source, styles, docs, playground states, tests, roadmap, and
  state coverage synchronized.
- Prefer incremental verified slices over repository-wide rewrites.

## Source Layout

```text
projects/ui/src/lib/
  components/<primitive>/
  providers/
  theme/
  tokens/
  types/
  utils/
projects/ui/src/styles/
projects/playground/src/app/pages/<primitive>/
docs/
.agents/
```

Rules:

- Public library code lives under `projects/ui/src/lib`.
- Runtime component CSS lives under `projects/ui/src/styles` and is imported by
  `projects/ui/src/styles/kikita-ui.css`.
- Public docs and release facts live in `docs/` and `CHANGELOG.md`.
- DI provider defaults are public API. Before adding or changing them, read
  `docs/di-defaults.md` and preserve the documented precedence chain.
- Agent operating rules and repo-distributed skills live in `.agents/`.
- `.local-notes/` may guide work, but tracked docs and public typings are the
  durable source of truth.

## Component Architecture

- Prefer native-element directives for primitives that already have native
  semantics.
- Use components when projected structure, roving focus, coordinated state, or
  overlay/container behavior is required.
- Keep each primitive in its own folder with a local `index.ts`.
- Export only intended public APIs from the primitive barrel, component barrel,
  and root public API.
- Keep template-facing members `protected`; keep implementation-only members
  `private`; make stable references `readonly`.

## Public API Contract

Every public component, directive, provider, service, type, token, interface, and
utility intended for consumers must have:

- JSDoc;
- an intentional export path;
- strict TypeScript types;
- docs that describe shipped behavior;
- focused tests when behavior or integration is non-trivial.

Use `readonly` in public interfaces when consumers should not mutate values
provided by the library. Do not add readonly mechanically to writable input
models, callbacks, mutable form values, or objects intended for user editing.

## Decisions

Record architecture changes that alter source layout, dependency direction,
public API shape, SSR strategy, theming contract, generated artifacts, or agent
surface generation under `.agents/decisions/`.
