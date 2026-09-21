# Style And Design Rules

## Language And Encoding

- All git-tracked repository content must be written in English: code comments,
  docs, examples, ARIA labels, playground text, test names, commit-facing notes,
  and default UI strings.
- Do not add Cyrillic text or mojibake/garbled encoding to tracked files.
- Local untracked notes may use any language.

## Style Architecture

- CSS variables are the public theming contract.
- SCSS is allowed as an authoring/convenience layer, not as the runtime theme API.
- Keep `projects/ui/src/styles/kikita-ui.css` as the single public style
  entrypoint for `@kikita-labs/ui/styles`.
- Author real styles in per-layer/per-primitive files under
  `projects/ui/src/styles/`.
- Import every public primitive style file from `kikita-ui.css`; do not hide
  required component CSS in playground styles.
- Use CSS `@layer` for Kikita-owned CSS. Current layers are `kui.base` and
  `kui.components`.
- Component CSS must consume Kikita CSS variables. Do not introduce hardcoded
  design colors when a `--kui-*` token exists or should exist.
- Playground SCSS may arrange demos, grids, and state simulations, but it must
  not become the source of component styling.

## Playground Architecture

- Playground routes are lazy standalone page components under
  `projects/playground/src/app/pages/<name>/`.
- Each playground page should keep its template and SCSS next to the page
  component: `<name>.page.ts`, `<name>.page.html`, `<name>.page.scss`.
- Keep `projects/playground/src/app/app.scss` for shell/global playground layout
  only.
- Use `projects/playground/src/app/shared/panel` for repeated board panels.
- Playground is a development/spec board, not the public docs site, but it should
  still expose real component states and catch obvious responsive/theming
  defects.

## Text Overflow And Truncation

- Do not add `overflow: hidden` as a mechanical fix for text that does not fit.
  It can clip glyphs with descenders (`g`, `p`, `q`, `y`, `j`) when the text
  wrapper has a constrained line box or `line-height`.
- Decide the width policy first: allow wrapping, grow the surface with its
  content, or set an explicit width. For dropdowns, the default
  `panelWidth="anchor"` intentionally keeps the panel trigger-sized; use
  `panelWidth="content"` for menu-like labels that should remain readable.
- Use `text-overflow: ellipsis` only for a deliberately one-line surface with
  a dedicated text wrapper. Verify normal and focused states, selected icons,
  descenders, and zoomed text in a browser before treating it as complete.

## Overlay Positioning

- Overlay primitives must use Angular CDK or Angular Aria for positioning and
  interaction behavior.
- With Angular/CDK 22, do not rely on `overlayX: 'center'` or `overlayX: 'end'`
  for trigger-aligned overlays whose pane size is unknown before first paint.
- Prefer a stable CDK connection with `overlayX: 'start'`, then apply alignment
  compensation on an inner wrapper (`translateX(-50%)` or `translateX(-100%)`)
  when center/end alignment is required.
- Test start, center, and end alignment visually in the playground before marking
  overlay primitives done.
- Verify overlay trigger ARIA after open/close: `aria-controls` must point to an
  existing panel only while the panel exists.

## Internal Typography Composition

| Text responsibility                                               | Implementation                                                               |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Consumer-facing typography role, such as Link variant             | Compose `KuiTextDirective`, explicitly exposing only intended inputs         |
| Component label with size, selection, disabled, or severity state | Use component/semantic CSS tokens; keep state colors owned by the component  |
| Projected rich content                                            | Preserve consumer markup and native semantics; avoid automatic text wrappers |
| SVG axes and marks                                                | Use SVG/CSS typography; do not add HTML text wrappers                        |

`kuiText` applies both role and tone classes. Its default tone must not override
selected, solid, disabled, or invalid text colors. Link exposes only `variant`;
Link's own tone controls color. Do not override composed size/weight/line-height
in the component layer. Heading semantics still require native heading elements.

Do not add a directive to every internal string. Font-token normalization belongs
to token maintenance and must preserve density, wrapping, zoom, and state contrast.

## Design Escalation

Before new or changed visuals, follow `docs/design-provenance.md` and read the
matching approved component design record. Local exports are optional authoring
inputs; essential requirements and approval evidence must be available in the
tracked record before implementation.

If states, variants, tokens, layout, visual behavior, or approval are missing or
unclear, stop the affected visual work and report the gap. Existing source is
not retroactive design approval. Do not invent a design.
