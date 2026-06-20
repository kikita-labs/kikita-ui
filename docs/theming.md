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
