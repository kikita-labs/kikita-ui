# CSS Architecture

CSS engine: SCSS.

- Use native CSS `@layer` to order cascade priority explicitly, instead of relying on
  source order or specificity fights.

- @kikita-labs/ui (workspace source) owns its own layers — do not fight them with `!important`; add project layers
  after the library's in the layer order.
- Minimum layer set for this project:

```css
@layer app.base, app.components, app.utilities;
```

- `app.base` — resets, global tokens/custom properties, base element styles.
- `app.components` — per-component styles.
- `app.utilities` — small single-purpose overrides, used sparingly.
- Declare the layer order once, early (e.g. in `src/styles/layers.scss`, imported first),
  then author each file's rules inside its matching `@layer` block.
- CSS custom properties (design tokens) are the public styling contract — components read
  `var(--app-*)`, never a hardcoded size or color. See
  `component-structure.md` for the token-usage rule.
- Any grouped set of tokens that doesn't belong inline in the entrypoint gets its own file
  under `src/styles/`, imported once from the entrypoint — the pattern isn't limited to
  `layers.scss`/mixins. Typographic tokens (font sizes, line-heights, weights, families) live
  in `styles/typography.scss` as custom properties inside `app.base`, consumed
  via `var(--app-text-*)` — components never hand-roll `font-size`/`line-height` per
  instance. If a UI library was chosen and it ships a typography primitive, use that instead
  of these tokens — see `ui-library-usage.md`.

- SCSS is an authoring convenience (nesting, mixins, functions) — it compiles to the same
  layered CSS; it is not a separate runtime theme mechanism. Use `@use`/`@forward`, never
  the deprecated `@import` — this is a Sass-only rule, native CSS has no module system to
  choose between.
- Any grouped set of partials (mixins, tokens, third-party overrides) lives in its own
  folder under `src/styles/`, with a barrel `_index.scss` that re-exports the folder's
  partials via `@forward` — same discipline as `index.ts` barrels for TS. Reach for the
  folder+barrel form as soon as a category has room to grow (more than one file's worth of
  content expected over time), not only once it already has 3-4 files — migrating a flat
  partial into a folder later means rewriting every direct import of it. A category that's
  genuinely one-off and won't grow (e.g. a single z-index scale) can stay a flat
  `_name.scss` file instead.
- Group partials by meaning, not one-mixin/one-token-per-file — `_button-mixins.scss`,
  `_color-tokens.scss`, not a file per individual mixin or token.
- Example shape:

  ```
  src/
    styles.scss
    styles/
      mixins/
        _button-mixins.scss
        _layout-mixins.scss
        _index.scss
      tokens/
        _color-tokens.scss
        _font-tokens.scss
        _layout-tokens.scss
        _index.scss
      ui-kit-overrides/
        _button.scss
        _index.scss
  ```

  Each folder's `_index.scss` only `@forward`s its siblings:

  ```scss
  // styles/tokens/_index.scss
  @forward './color-tokens';
  @forward './font-tokens';
  @forward './layout-tokens';
  ```

  `styles.scss` (the single entrypoint) then `@use`s each folder once, with an explicit
  namespace:

  ```scss
  @use './styles/mixins' as mixins;
  @use './styles/tokens' as tokens;
  @use './styles/ui-kit-overrides';
  ```

- Partials are `@use`d only from `styles.scss` (the single entrypoint) or from another
  partial that's itself reached from it — never directly from a component stylesheet. A
  component importing a partial straight from `src/styles/` bypasses the single-entrypoint
  contract and can duplicate the partial's output into the component's own CSS bundle.
- One single entrypoint stylesheet imports every layer file, in layer-declaration order.
  Don't scatter ad-hoc `<style>` imports that bypass it.
- No inline styles (`[style]` binding or `style="..."` attribute) in templates. They bypass
  the layer cascade and the token contract, and can't be overridden by `@layer` rules. Use
  a class in the matching layer instead; if the value is truly dynamic and can't be a static
  class, bind a CSS custom property (`[style.--foo]`) and consume it via `var(--foo)` inside
  a real stylesheet rule.

## Review Checklist

- [ ] New styles land in the correct `@layer`, not unlayered.
- [ ] No `!important` used to fight another layer's specificity.
- [ ] No hardcoded size/color — goes through a `var(--app-*)` token.
- [ ] New style file is imported from the single entrypoint, in the right layer order.
- [ ] No `[style]`/`style="..."` in templates — dynamic values go through a CSS custom
      property, not an inline style.
- [ ] No hand-rolled `font-size`/`line-height` per component — typography goes through
      `styles/typography.scss` tokens, or the UI library's typography primitive if
      one was chosen.

- [ ] SCSS partials use `@use`/`@forward`, never `@import`; a grouped category (mixins,
      tokens, overrides) is a folder with a `_index.scss` barrel, not loose flat files once
      it has room to grow. No component stylesheet `@use`s a partial directly.
