# Code Style

How code is written and formatted in this project. Prettier owns whitespace/formatting;
ESLint owns correctness and code-quality rules. Don't hand-format around Prettier — the
blank-line rules below aren't enforced by it and are on you to apply and check in review.

- [imports.md](./imports.md) — import grouping and ordering.
- [html-markup.md](./html-markup.md) — Angular template formatting rules.
- [component-structure.md](./component-structure.md) — class member order, visibility,
  styling via tokens.
- [rxjs-and-signals.md](./rxjs-and-signals.md) — when to use RxJS vs signals.
- [forms-and-inputs.md](./forms-and-inputs.md) — Signal Forms vs `ngModel`, schema/validator
  reuse, model typing.
- [css-architecture.md](./css-architecture.md) — `@layer` cascade layers, design tokens,
  single stylesheet entrypoint.

- [ui-library-usage.md](./ui-library-usage.md) — primitive/reuse precedence, layout-only
  styling, typography primitives.

Adding a new code-style doc: only when a rule doesn't fit naturally into one of the above.
Link it here immediately.

If the user changes or corrects a code-style rule (import order, member order, formatting,
CSS layering — anything above), update the matching file in the same change, right when
they say it — don't wait for the same correction to happen twice. See
`../documentation.md`.
