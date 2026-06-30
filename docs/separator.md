# Separator

`hr[kuiSeparator]` is a semantic divider for separating related groups of
content or actions. Use it instead of local ad-hoc borders when a real divider
is part of the component surface.

## Import

```ts
import { KuiSeparatorDirective } from '@kikita-labs/ui';
```

Import styles once:

```css
@import '@kikita-labs/ui/styles/kikita-ui.css';
```

## Basic Usage

```html
<section>
  <p>Account details</p>
  <hr kuiSeparator />
  <p>Billing details</p>
</section>
```

Use the native `<hr>` host. Do not use a `div` for purely visual separators
unless a future primitive explicitly supports it.

## Appearance

Visual variants use the shared `appearance` input. The marker directive remains
boolean-like and separate from styling options:

```html
<hr kuiSeparator appearance="subtle" />
<hr kuiSeparator appearance="default" />
<hr kuiSeparator appearance="strong" />
```

Do not encode visual variants in the marker directive value, for example
`kuiSeparator="strong"`. Kikita primitives keep the marker and appearance inputs
separate.

## Spacing

```html
<hr kuiSeparator spacing="none" />
<hr kuiSeparator spacing="xs" />
<hr kuiSeparator spacing="sm" />
<hr kuiSeparator spacing="md" />
<hr kuiSeparator spacing="lg" />
```

## Vertical

```html
<div class="toolbar">
  <button kuiButton appearance="ghost">Bold</button>
  <button kuiButton appearance="ghost">Italic</button>
  <hr kuiSeparator orientation="vertical" spacing="xs" />
  <button kuiButton appearance="ghost">Link</button>
</div>
```

Vertical separators set `aria-orientation="vertical"` and stretch to the parent
block size.

## API

### `hr[kuiSeparator]`

| Input         | Type                                     | Default        | Description                    |
| ------------- | ---------------------------------------- | -------------- | ------------------------------ |
| `appearance`  | `'subtle' \| 'default' \| 'strong'`      | `'default'`    | Visual divider emphasis.       |
| `orientation` | `'horizontal' \| 'vertical'`             | `'horizontal'` | Divider direction.             |
| `spacing`     | `'none' \| 'xs' \| 'sm' \| 'md' \| 'lg'` | `'sm'`         | Outer spacing around the line. |

## Accessibility

- Prefer native `<hr kuiSeparator>`.
- The separator is not focusable and has no hover, focus, active, or disabled
  states.
- Vertical separators expose `aria-orientation="vertical"`.
- Do not add labels by default; named separators should be rare structural
  boundaries.

## Tokens

| Token                                     | Purpose                          |
| ----------------------------------------- | -------------------------------- |
| `--kui-separator-color-subtle`            | Low-emphasis divider color.      |
| `--kui-separator-color-default`           | Default divider color.           |
| `--kui-separator-color-strong`            | High-emphasis divider color.     |
| `--kui-separator-thickness`               | Divider thickness.               |
| `--kui-separator-vertical-min-block-size` | Minimum vertical divider height. |
| `--kui-separator-spacing-none`            | No outer spacing.                |
| `--kui-separator-spacing-xs`              | Extra-small spacing.             |
| `--kui-separator-spacing-sm`              | Small/default spacing.           |
| `--kui-separator-spacing-md`              | Medium spacing.                  |
| `--kui-separator-spacing-lg`              | Large spacing.                   |

## Relationship To Menu

`kui-menu` uses `hr[kuiSeparator]` directly. Keep future menu examples on the
generic separator primitive instead of adding menu-specific divider APIs.
