# Theming

## Public Contract

CSS variables are the public runtime theming contract.

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

## Custom Seeds

```ts
provideKikitaUi({
  theme: {
    seeds: {
      color: {
        primary: 'oklch(0.52 0.25 285)',
        neutral: 'oklch(0.5 0.01 80)',
        success: 'oklch(0.54 0.16 145)',
        warning: 'oklch(0.74 0.16 75)',
        danger: 'oklch(0.54 0.22 25)',
        info: 'oklch(0.58 0.16 215)',
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
