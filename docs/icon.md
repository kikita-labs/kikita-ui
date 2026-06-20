# Icon

`kui-icon` renders icons from a trusted inline SVG registry, direct trusted SVG source, or an external image URL.

## Register Icons

```ts
import { provideKikitaUi, provideKuiIcons } from '@kikita-labs/ui';

export const appConfig = {
  providers: [
    provideKikitaUi(),
    provideKuiIcons({
      check:
        '<svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3 3 7-7" stroke="currentColor"/></svg>',
    }),
  ],
};
```

## Usage

```html
<kui-icon name="check" label="Success" />
<kui-icon src="/assets/logo.svg" label="Logo" />
<kui-icon name="check" />
```

Omit `label` for decorative icons. Decorative icons render with `aria-hidden="true"`.

## Security

Registered and direct SVG sources must be trusted static application code. Do not pass user-generated SVG markup into `provideKuiIcons()` or `[source]`.
