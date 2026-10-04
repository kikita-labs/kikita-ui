# Theming

## Public Contract

CSS variables are the public runtime theming contract. Class names are a separate namespace: a
`kui-*` class is stable only where a component page documents it (for example `.kui-field-affix`);
the other anatomy classes (`kui-pagination__page-size-label`) are internal and may change in a
minor release.

Kikita UI uses this pipeline:

```text
seed tokens -> OKLCH palettes -> semantic tokens -> component tokens
```

Theme mode is selected with `data-kui-theme`:

```html
<html data-kui-theme="dark"></html>
```

## Overriding Tokens

Where you set a token decides how far it reaches:

| Override                                                             | Where it works                                                                                       |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| A seed in `provideKikitaUi({ theme })`                               | The whole theme: palette, semantic roles and literal component tokens are regenerated.               |
| A semantic token (`--kui-color-danger-fill`) on any element          | That element and everything below it. On `:root` or `<html>` it changes the whole page.              |
| A component token (`--kui-btn-danger-bg`) on any element             | That element and everything below it, for that one component part.                                   |
| A palette step (`--kui-danger-6`) or a type role alias on an element | Not reliable: semantic tokens and `--kui-type-*` are resolved from them on `:root`. Set it globally. |

Components read semantic or component tokens, never palette or seed variables; `pnpm audit:static`
fails when a style under `projects/ui/src` or the Playground reads `--kui-<scale>-<step>` or
`--kui-seed-*`.

Component tokens are inputs, not outputs. A component states its default in its own CSS, for
example `var(--kui-card-bg, var(--kui-color-surface))`, and the generated stylesheet does not
define that token. Setting `--kui-card-bg` on an ancestor therefore wins, and so does changing
`--kui-color-surface` on the same ancestor, because both are read where the component renders. The
generated stylesheet defines only literal component tokens (sizes, gaps, durations), the semantic
`--kui-type-*` roles and the density-dependent `--kui-btn-px`. Do
not read a component token in your own CSS without a fallback: it has no value unless someone sets
it.

To restyle one region, set component or semantic tokens on its container:

```css
.billing-panel {
  --kui-btn-danger-bg: oklch(0.5 0.2 25);
  --kui-btn-danger-bg-hov: oklch(0.44 0.2 25);
}
```

## Angular Provider

Use `provideKikitaUi()` for the default Ember theme.

```ts
import { ApplicationConfig } from '@angular/core';
import { provideKikitaUi } from '@kikita-labs/ui';

export const appConfig: ApplicationConfig = {
  providers: [provideKikitaUi()],
};
```

Optional base CSS is available as a package style entrypoint:

```scss
@import '@kikita-labs/ui/styles';
```

The provider generates CSS variables and installs them into a single runtime stylesheet:

```css
:root,
[data-kui-theme='light'] {
  --kui-seed-primary: oklch(0.52 0.25 285);
  --kui-primary-6: oklch(0.52 0.25 285);
  --kui-color-primary-fill: var(--kui-primary-6);
  --kui-btn-solid-bg: var(--kui-color-primary-fill);
}

[data-kui-theme='dark'] {
  --kui-color-primary-fill: var(--kui-primary-5);
  --kui-btn-solid-bg: var(--kui-color-primary-fill);
}
```

## Defaults, Layers And Density

`@kikita-labs/ui/styles` includes `theme-default.css`, generated from `DEFAULT_KUI_THEME` (`pnpm
generate:theme-css`; a test keeps it in sync), so the default theme works from CSS alone and the first
paint does not wait for a script. `provideKikitaUi()` adds the theme of custom seeds on top of it.

The generated variables live in the `kui.tokens` cascade layer, declared before `kui.base` and
`kui.components`. A variable that you write outside any layer, for example `:root { --kui-color-bg: ...
}`, always wins over the generated one, whatever the order of the style sheets.

`provideKikitaUi()` sets `data-kui-density` on `<html>` from `seeds.density`, on the server too, unless
the page already set it; `styles/density.css` turns it into the horizontal padding.

The neutral seed tints the neutral scales of both modes, so surfaces, borders, text, skeletons and
scrollbars follow `seeds.neutral`. Contrast is part of the contract: for any seed, every pair of roles
the library draws reaches 4.5:1 (text) or 3:1 (non-text); the generator picks white or near-black text for
each solid fill and corrects a seed that neither reaches 4.5:1 on.

## Migrating To The Colour Roles

The 2.x colour system keeps every public token name, so an existing theme keeps working. Move to the
new roles when you next touch a custom component:

| Before                                                      | After                                                                    | Why                                                        |
| ----------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `--kui-color-on-fill` on a solid fill                       | `--kui-color-<role>-on-fill`                                             | White or near-black, whichever reaches 4.5:1 on that fill. |
| `--kui-color-<role>-fill` as text or an icon colour         | `--kui-color-<role>-text`                                                | 4.5:1 on every surface.                                    |
| `--kui-color-<role>-fill` as a border, outline, bar or mark | `--kui-color-<role>-indicator`                                           | 3:1 on every light surface.                                |
| `--kui-color-border` on an interactive control              | `--kui-color-border-control` (hover: `--kui-color-border-control-hover`) | 3:1 boundary at rest.                                      |
| `--kui-color-primary-focus-ring` or a `box-shadow` ring     | a 2px `outline` in `--kui-color-focus`                                   | Visible in forced-colors mode and 3:1.                     |
| `--kui-color-text-disabled` on placeholders                 | `--kui-color-text-placeholder`                                           | 4.5:1; disabled text stays for disabled controls.          |

Other changes to know about: `--kui-neutral-1` to `--kui-neutral-12` are one scale per mode, accent
steps sit at fixed tones, and `--kui-input-focus-ring` defaults to `none`. `--kui-color-on-fill` and
`--kui-color-primary-focus-ring` are deprecated and removed in 3.0. The full list is in
`CHANGELOG.md`.

## Custom Seeds

```ts
provideKikitaUi({
  theme: {
    seeds: {
      color: {
        primary: 'oklch(0.52 0.25 285)',
        neutral: 'oklch(0.5 0.01 80)',
        success: 'oklch(0.54 0.16 145)',
        warning: 'oklch(0.56 0.15 65)',
        danger: 'oklch(0.54 0.22 25)',
        info: 'oklch(0.53 0.14 215)',
      },
      radius: 8,
      density: 'regular',
    },
  },
});
```

## Direct Generation

The generator can be used without Angular DI for docs, visual tests, or tooling.

```ts
import { createKuiTheme, createKuiThemeStyleSheet, DEFAULT_KUI_THEME } from '@kikita-labs/ui';

const theme = createKuiTheme(DEFAULT_KUI_THEME);
const css = createKuiThemeStyleSheet(theme);
```
