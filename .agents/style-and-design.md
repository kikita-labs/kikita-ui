# Style And Design Rules

## Language And Encoding

- All git-tracked repository content must be written in English: code comments,
  docs, examples, ARIA labels, playground text, test names, commit-facing notes,
  and default UI strings. Locale resource catalogues under
  `projects/kikita-ui-playground/public/i18n/` are the exception and use their locale's
  native language.
- Do not add Cyrillic text or mojibake/garbled encoding to tracked files outside approved
  locale resource catalogues.
- Local untracked notes may use any language.

## Style Architecture

- CSS variables are the public theming contract.
- SCSS is allowed as an authoring/convenience layer, not as the runtime theme API.
- Keep `projects/ui/src/styles/kikita-ui.css` as the single public style
  entrypoint for `@kikita-labs/ui/styles`.
- Author each primitive's styles in `kui-<primitive>.css` beside the component.
  Layer-wide and cross-primitive styles (base, density, glyph, listbox, selection,
  forced colors) stay under `projects/ui/src/styles/`. `ng-package.json` mirrors
  `lib/**/*.css` into the package so `kikita-ui.css` resolves the same relative
  imports in the repository and in `dist`.
- Import every public primitive style file from `kikita-ui.css`; do not hide
  required component CSS in playground styles.
- Use CSS `@layer` for Kikita-owned CSS. Current layers are `kui.base` and
  `kui.components`.
- Component CSS must consume Kikita CSS variables. Do not introduce hardcoded
  design colors when a `--kui-*` token exists or should exist.
- Playground SCSS may arrange demos, grids, and state simulations, but it must
  not become the source of component styling.

## Component Token Pattern

Palette -> semantic -> component is the only direction tokens flow. These rules are enforced by
`pnpm audit:static` and described for consumers in `docs/tokens.md` and `docs/theming.md`.

- Component CSS never reads palette steps (`--kui-<scale>-<step>`) or seeds (`--kui-seed-*`).
- Every color part reads a component token whose default is the semantic role:
  `color: var(--kui-card-color, var(--kui-color-text))`. Name it
  `--kui-<component>-<part>-<property>[-<state>]` (`bg`, `color`, `border`, `focus-ring-color`).
- Radius, font size, height, gap and padding of a component part follow the same pattern with the
  scale token as the default. A square control uses one `-size` token for width and height. Margin,
  positional offsets, motion, border width, fonts, z-index and shadows read their global tokens directly.
- A component states its default in its CSS. The generated stylesheet defines only literal component
  tokens (and the `--kui-type-*` roles, `--kui-btn-px`), never an alias such as `--kui-card-bg:
var(--kui-color-surface)`: an alias on `:root` is resolved there and descendants inherit the finished
  value, so a token set on a subtree would not reach the component.
- A component never defines a public `--kui-*` token on its own element. Variant defaults (size,
  appearance, state) go in private `--_kui-*` variables, read as
  `var(--kui-x, var(--_kui-x, <fallback>))`, so a value set on any ancestor wins. The only public
  tokens a component may assign are parent-to-child APIs, listed in `parentAssignedTokens` in
  `scripts/verify-static-audit.mjs`.
- When two parts share a hook name they must share a default; add the state or part to the name
  otherwise. After adding hooks, check that no new name collides with an existing token.
- Behaviour shared by components reads a shared token, never a copy of its value: font weight
  (`--kui-font-weight-*`), motion (`--kui-duration-*`, `--kui-ease`, `--kui-ease-exit`), focus ring size
  (`--kui-focus-ring-width[-sm]`, `--kui-focus-ring-offset[-inset]`), disabled opacity
  (`--kui-opacity-disabled`), scrim (`--kui-color-scrim[-strong]`), text line height (the
  `--kui-type-*-line-height` roles, `--kui-line-height-control`) and corner radius (`--kui-radius-*`).
  A component hook defaults to the shared token in the component's CSS; the generator never defines the
  hook as a literal, because a literal on `:root` would shadow a change to the shared token. Do not write a
  literal fallback for a global scale token. `pnpm audit:static` enforces all of this; a reviewed
  exception carries a reason and an owner.
- A literal stays private when it is not a design value: visually hidden boilerplate, optical offsets,
  pseudo-element drawings, `50%` circles, `line-height: 0` or `1`, reduced-motion idioms, layout invariants.
  A size becomes a token when it is a size-variant ladder or repeats where it must stay in sync.
- Typography classes and tones (`typography.css`) are the semantic layer and may read colour roles
  directly.

## Playground Architecture

- Playground routes are lazy standalone page components under
  `projects/kikita-ui-playground/src/app/features/playground/pages/<catalog-group>/<name>/`.
  The page structure, inventory and example conventions live in
  `projects/kikita-ui-playground/.agents/component-page-authoring.md`.
- Keep `projects/kikita-ui-playground/src/app/app.scss` for shell/global playground layout
  only.
- Playground is a development/spec board, not the public docs site, but it should
  still expose real component states and catch obvious responsive/theming
  defects.

## Border Roles

Pick the border role by what identifies the component, not by how it should look:

- The border is the only thing that shows the component (input, select, textarea, checkbox, radio):
  `--kui-color-border-control` (3:1 in `strict`).
- Dividers and cards: `--kui-color-border`, `--kui-color-border-strong`.

A new contrast mode is an entry in `KUI_CONTRAST_PROFILES` (see `docs/theming.md#contrast-profiles`), never a
branch inside a component. Components read roles only and do not know the profile.

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
| Consumer-facing typography role, such as Link variant             | Compose `KuiText`, explicitly exposing only intended inputs                  |
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
