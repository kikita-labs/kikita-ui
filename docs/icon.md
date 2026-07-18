# Icon

`kui-icon` renders icons from a pluggable icon set, direct trusted SVG source, or an external
image URL. By default, unregistered names resolve to [Lucide](https://lucide.dev) icons, fetched
lazily from the jsDelivr CDN by name -- no icon package install required.

## Import

```ts
import { KuiIconComponent, provideKuiIcons } from '@kikita-labs/ui';
```

Import runtime styles once:

```ts
import '@kikita-labs/ui/styles';
```

## Default Icon Set

`provideKikitaUi()` registers a default resolver that fetches Lucide icon SVGs by name (e.g.
`name="trash"`, `name="settings"`) from `cdn.jsdelivr.net/npm/lucide-static@1`, matching Lucide's
kebab-case icon names. Resolved SVGs are cached in memory for the app's lifetime, shared across
every `kui-icon` that requests the same name.

```ts
import { ApplicationConfig } from '@angular/core';
import { provideKikitaUi } from '@kikita-labs/ui';

export const appConfig: ApplicationConfig = {
  providers: [provideKikitaUi()],
};
```

```html
<kui-icon name="trash" label="Delete" />
```

Set `icons: false` to opt out of the default resolver entirely (no network request is ever made):

```ts
provideKikitaUi({ icons: false });
```

## Custom And Overriding Icon Sets

`provideKuiIcons()` accepts either a static registry (`Record<name, svgString>`) or an async
resolver function (`(name) => Promise<svgString | undefined>`). It can be called multiple times;
a later call takes precedence over an earlier one for names both define. This is how a custom set
overrides the default Lucide resolver, either globally or scoped to a subtree:

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

An async resolver -- for example, backed by a different icon library, or a company's proprietary
icon set:

```ts
import { KuiIconResolver, provideKuiIcons } from '@kikita-labs/ui';

const resolveMaterialIcon: KuiIconResolver = async (name) => {
  const response = await fetch(`https://fonts.gstatic.com/s/i/materialicons/${name}/v1/24px.svg`);
  return response.ok ? response.text() : undefined;
};

provideKuiIcons(resolveMaterialIcon);
```

Provide it in a specific component's `providers` array instead of the root injector to scope an
override to that subtree only -- everywhere else keeps resolving through the default Lucide
resolver (or whatever the root registered).

## Usage

```html
<kui-icon name="check" label="Success" />
<kui-icon src="/assets/logo.svg" label="Logo" />
<kui-icon name="check" />
```

Omit `label` for decorative icons. Decorative icons render with `aria-hidden="true"`.

`source` (direct inline SVG markup) always takes precedence over `name` and resolves
synchronously -- no registry lookup, no network request.

## Size

Use named presets for design-system sizing:

```html
<kui-icon name="check" size="2xs" />
<kui-icon name="check" size="xs" />
<kui-icon name="check" size="sm" />
<kui-icon name="check" size="md" />
<kui-icon name="check" size="lg" />
<kui-icon name="check" size="xl" />
<kui-icon name="check" size="2xl" />
```

The default remains `1em`, so an icon without `size` follows the surrounding text or parent
control sizing. Presets map to CSS variables with built-in fallbacks:

| Preset | CSS variable          | Fallback   |
| ------ | --------------------- | ---------- |
| `2xs`  | `--kui-icon-size-2xs` | `0.75rem`  |
| `xs`   | `--kui-icon-size-xs`  | `0.875rem` |
| `sm`   | `--kui-icon-size-sm`  | `1rem`     |
| `md`   | `--kui-icon-size-md`  | `1.25rem`  |
| `lg`   | `--kui-icon-size-lg`  | `1.5rem`   |
| `xl`   | `--kui-icon-size-xl`  | `2rem`     |
| `2xl`  | `--kui-icon-size-2xl` | `2.5rem`   |

Numbers are converted to pixels and arbitrary CSS size strings still pass through:

```html
<kui-icon name="settings" [size]="24" />
<kui-icon name="settings" size="1.25em" />
<kui-icon name="settings" size="calc(1rem + 2px)" />
```

## Resolution Order

For a given `name`, `kui-icon` checks every provided `KUI_ICONS` entry from the most recently
provided to the least recently provided (so a component-level `provideKuiIcons()` beats a root
one, and a later root call beats an earlier one), falling through to the next entry only if the
current one doesn't resolve the name.

## Security

Registered and direct SVG sources must be trusted static application code. Do not pass
user-generated SVG markup into `provideKuiIcons()` or `[source]`. A custom resolver fetching from
a remote endpoint must point at a trusted, application-controlled or well-known public source
(like the built-in Lucide CDN default) -- never resolve a name to a URL built from user input.
