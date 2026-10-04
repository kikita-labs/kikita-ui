# Icon

`kui-icon` renders icons from a pluggable icon set, direct icon content, or an external image URL.
By default, unregistered names resolve to [Lucide](https://lucide.dev) icons, fetched lazily from the
jsDelivr CDN by name -- no icon package install required.

An icon is either **glyph data** (`KuiIconGlyph`, drawn from an allowlist, safe from any source) or
**trusted SVG markup** (a string, inserted as HTML). The structural icons that components draw for
themselves (close, chevrons, status marks) are a separate system; see
[Structural Icons](structural-icons.md).

## Import

```ts
import { KuiIcon, provideKuiIcons } from '@kikita-labs/ui';
```

Import runtime styles once:

```ts
import '@kikita-labs/ui/styles';
```

## Default Icon Set

`provideKikitaUi()` registers a default resolver that fetches Lucide icon SVGs by name (e.g.
`name="trash"`, `name="settings"`) from `cdn.jsdelivr.net/npm/lucide-static@<version>`, matching Lucide's
kebab-case icon names. The version is pinned in the library (`KUI_LUCIDE_STATIC_VERSION`), so a given
Kikita UI release always draws the same icons and a new upstream release cannot change them
silently. Resolved icons are cached in memory for the app's lifetime, shared across every `kui-icon`
that requests the same name.

The fetched file is not inserted as markup. It is converted to glyph data with the allowlist described
in [Structural Icons](structural-icons.md#glyph-data): only drawing elements and their geometry and paint
attributes survive, and a file that contains anything else (script, `<use>`, text, an unknown element)
is rejected and the icon stays empty. Every icon of the Lucide set passes unchanged, so a replaced or
compromised file cannot inject script or load another resource. Names that are not Lucide kebab-case
names resolve to nothing without a request.

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

Names resolved through the default set always need a network request, so they render when the request
settles, not on the first pass. Allow `connect-src https://cdn.jsdelivr.net` in a Content Security
Policy, or read the files from your own origin (below).

Set `icons: false` to opt out of the default resolver entirely (no network request is ever made):

```ts
provideKikitaUi({ icons: false });
```

`provideKikitaUi()` also registers a small built-in brand icon set alongside the Lucide resolver,
resolved locally with no network request. Currently it contains one icon, the Kikita UI wordmark
glyph:

```html
<kui-icon name="kikita-brand" label="Kikita UI" />
```

It is also disabled by `icons: false`.

### Another version or origin

`createKuiLucideResolver` builds the same safe resolver for another `lucide-static` version or for
files you host yourself:

```ts
import { createKuiLucideResolver, provideKikitaUi, provideKuiIcons } from '@kikita-labs/ui';

provideKikitaUi({ icons: false });
provideKuiIcons(createKuiLucideResolver({ baseUrl: '/assets/lucide' }));
```

## Custom And Overriding Icon Sets

`provideKuiIcons()` accepts either a static registry (`Record<name, icon>`) or an async resolver
function (`(name) => Promise<icon | undefined>`), where an icon is glyph data or trusted SVG markup.
It can be called multiple times; a later call takes precedence over an earlier one for names both
define. This is how a custom set overrides the default Lucide resolver, either globally or scoped to
an environment injector such as a route:

```ts
import { provideKikitaUi, provideKuiIcons } from '@kikita-labs/ui';

export const appConfig = {
  providers: [
    provideKikitaUi(),
    provideKuiIcons({
      // Glyph data: safe from any source, drawn on the first pass.
      check: { node: [['path', { d: 'M3 8l3 3 7-7' }]], viewBox: '0 0 16 16' },
      // Trusted static markup: for rich SVG (gradients, groups) that glyph data cannot express.
      logo: '<svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3 3 7-7" stroke="currentColor"/></svg>',
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

`provideKuiIcons()` returns environment providers, so put it in the application config, a route's
`providers`, or an environment injector -- not in a component's `providers` array.

## Usage

```html
<kui-icon name="check" label="Success" />
<kui-icon [source]="glyph" label="Gauge" />
<kui-icon src="/assets/logo.svg" label="Logo" />
<kui-icon name="check" />
```

Omit `label` for decorative icons. Decorative icons render with `aria-hidden="true"`.

`source` (direct glyph data or inline SVG markup) always takes precedence over `name`; its content
renders synchronously. A `name` that is found in a static registry also renders synchronously, on
the first pass, with no promise and no network request. Only names that need an async resolver
render when it settles.

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

## Stroke Width

Stroke-based icons (Lucide and most line sets) can be made thinner or thicker, and can keep the same
line width in pixels at any size:

```html
<kui-icon name="settings" [strokeWidth]="1.5" />
<kui-icon name="settings" [size]="96" absoluteStrokeWidth />
```

| Input                 | Type               | Default | Effect                                                                                                       |
| --------------------- | ------------------ | ------- | ------------------------------------------------------------------------------------------------------------ |
| `strokeWidth`         | `number \| string` | unset   | Stroke width in glyph-grid units (24 by 24 for Lucide). Sets `--kui-icon-stroke-width` on the host.          |
| `absoluteStrokeWidth` | `boolean`          | `false` | Keeps the stroke the same number of pixels at any size. Sets `--kui-icon-vector-effect: non-scaling-stroke`. |

The inputs only set CSS custom properties, so the same tokens work on `:root` or any subtree and also
move the structural icons; see [Structural Icons](structural-icons.md#stroke-width). An unset input
keeps the icon's own weight. Filled shapes and markup with an inline `style="stroke-width: …"` are not
affected.

## Resolution Order

For a given `name`, `kui-icon` checks every provided `KUI_ICONS` entry from the most recently
provided to the least recently provided (so a later `provideKuiIcons()` beats an earlier one),
falling through to the next entry only if the current one doesn't resolve the name. Static registries
answer without a promise; an async resolver hands the lookup to the async path. Names are matched
against the registry's own keys only, never inherited object properties.

## Security

Glyph data is drawn through an allowlist and is safe from any source. Trusted SVG markup (a string
registered with `provideKuiIcons()` or passed to `[source]`) is inserted as HTML and must be static
application code: do not pass user-generated markup. A custom resolver fetching from a remote
endpoint must point at a trusted, application-controlled or well-known public source -- never resolve
a name to a URL built from user input -- or return glyph data so the response cannot carry markup.
The built-in Lucide set is converted to glyph data, so it needs no such trust.
