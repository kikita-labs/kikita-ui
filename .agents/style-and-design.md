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

## Design Escalation

Before implementing any new component, check `.local-notes/claude-design/design system/`
for the matching component spec file, for example `02 Button.dc.html` or
`19 Popover.dc (1).html`.

If a component spec does not exist in `.local-notes/claude-design/design system/`
or states, variants, tokens, layout, or visual behavior are unclear or missing,
stop and tell the user. Do not invent a design.

Designed components are added to `.local-notes/claude-design/design system/`
before implementation begins.
