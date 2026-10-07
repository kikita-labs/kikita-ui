# UI Library Usage

- Build with @kikita-labs/ui (workspace source)'s primitives first — buttons, inputs, dialogs, layout primitives,
  typography. Reaching for a raw `<button>` or a hand-rolled dialog when @kikita-labs/ui (workspace source) already
  ships one defeats the reason it's in the project.
- Reuse order, most specific wins:
  1. An existing `shared/ui/` component that already wraps a @kikita-labs/ui (workspace source) primitive for this
     project's needs (see `../shared/README.md`) — reuse it instead of wrapping the same
     primitive again.
  2. @kikita-labs/ui (workspace source)'s own primitive, used directly.
  3. A hand-built component — only when neither of the above covers the case.
- Styling a @kikita-labs/ui (workspace source) primitive is layout only — spacing, sizing, positioning, via this
  project's tokens/layers (see `css-architecture.md`) — never its visual identity (color,
  border, shadow, typography). Re-skinning a primitive's look defeats the point of using a
  shared library. Override the library's own visual styling only when the user explicitly
  asks for that.
- Typography: if @kikita-labs/ui (workspace source) ships a typography primitive (kuiText —
  e.g. kikita-ui's `kuiText`), use it for all text content instead of a bare tag with
  hand-rolled `font-size`/`line-height`. Give it the correct semantic tag/role for the
  content it wraps — a heading is a heading, a paragraph is a paragraph — never default to
  `div`/`span` for text just because it's the path of least resistance. See
  `../accessibility.md`.
- If no UI library was chosen, this project's own typography tokens
  (`styles/typography.scss`, see `css-architecture.md`) are the equivalent — use
  those tokens/classes on real semantic tags, not one-off font styles per component.

## Review Checklist

- [ ] New UI reaches for an existing `shared/ui/` wrapper, then @kikita-labs/ui (workspace source)'s own primitive,
      before a hand-built component.
- [ ] Styles applied to a @kikita-labs/ui (workspace source) primitive are layout-only, not a re-skin of the
      library's visual identity — unless the user explicitly asked for that.
- [ ] Text content uses the library's typography primitive (or this project's typography
      tokens if no library was chosen) with the correct semantic tag — not `div`/`span`/`p`
      picked arbitrarily.
