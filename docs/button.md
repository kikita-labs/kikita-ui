# Button

`kuiButton` applies Kikita UI button styling to native `button` and `a` elements.

## Import

```ts
import {
  KuiButtonAppearance,
  KuiButton,
  KuiButtonShape,
  provideKuiDefaults,
} from '@kikita-labs/ui';
```

## Usage

```html
<button kuiButton>Save</button>
<button kuiButton shape="soft">Cancel</button>
<button kuiButton shape="outline" appearance="danger">Delete</button>
<button kuiButton shape="ghost" appearance="success">Approve</button>
<button kuiButton appearance="warning">Review</button>
<button kuiButton wrap>Long responsive label</button>
<button kuiButton [loading]="isSaving()">Save changes</button>

<a kuiButton shape="outline" href="/settings">Settings</a>
```

`shape` controls the surface treatment and `appearance` controls its semantic color intent. The
axes can be combined freely.

Without an explicit `appearance`, `solid` and `soft` use primary colors while `outline` and
`ghost` use their neutral defaults.

Use `iconStart`/`iconEnd` for a registered icon by name, instead of hand-projecting `kui-icon`:

```html
<button kuiButton appearance="success" iconStart="check">Save</button>
<button kuiButton shape="outline" iconEnd="arrow-right">Continue</button>
```

Project `kui-icon` directly when the icon needs `source` or `src` instead of a registered `name`:

```html
<button kuiButton appearance="success">
  <kui-icon [source]="checkIcon" />
  Save
</button>
```

## Inputs

- `shape`: `solid | soft | outline | ghost`; defaults to `solid`.
- `appearance`: `primary | danger | success | warning`; optional.
- `size`: `xs | sm | md | lg`; defaults to `md`.
- `wrap`: allows long button text to wrap instead of truncating in narrow containers.
- `disabled`: disables button behavior. Anchor buttons receive `aria-disabled="true"` and are
  removed from tab order.
- `loading`: centers a `kuiLoader` spinner over the button content, fades the content out while
  preserving its layout size, sets `aria-busy="true"`, and behaves like `disabled` (blocks clicks,
  `aria-disabled`, removed from tab order, native `disabled` attribute on `button` hosts).
- `iconStart`: renders a `kui-icon` resolved by name before the button's projected content.
- `iconEnd`: renders a `kui-icon` resolved by name after the button's projected content.

## Provider Defaults

Use `provideKuiDefaults` when an application section needs repeated button defaults, or the
`defaults` option of `provideKikitaUi` for the whole application:

```ts
providers: [
  provideKuiDefaults({
    button: { shape: 'ghost', appearance: 'primary', size: 'sm' },
    iconButton: { shape: 'outline', size: 'sm' },
  }),
];
```

Use root `provideKikitaUi({ defaults: { size: 'sm' } })` when the whole application should prefer
a different default control size. Button-specific options win over root defaults, and local inputs
always win over providers:

```text
local input > defaults.button / defaults.iconButton > defaults.size > component default
```

`kuiButton` and `kuiIconButton` are both button primitives, but their defaults are configured
through separate `button` and `iconButton` keys so one does not
accidentally restyle the other.

### Configurable options

`defaults.button`:

| Option       | Values                                                    | Description                                                                            |
| ------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `shape`      | `'solid' \| 'soft' \| 'outline' \| 'ghost'`               | Default surface shape.                                                                 |
| `appearance` | `'primary' \| 'danger' \| 'success' \| 'warning' \| null` | Default semantic color intent. Use `null` for each shape's neutral/default appearance. |
| `size`       | `'xs' \| 'sm' \| 'md' \| 'lg'`                            | Default button size. Takes precedence over the global `defaults.size`.                 |

## Migration from 0.1.4

Button surface treatments moved from `appearance` to `shape`. Semantic color now belongs to
`appearance` and can be combined with every shape.

```html
<!-- Before -->
<button kuiButton appearance="outline">Details</button>

<!-- After -->
<button kuiButton shape="outline">Details</button>

<!-- New combination -->
<button kuiButton shape="outline" appearance="danger">Delete</button>
```

## Accessibility

Use native `button` whenever the action does not navigate. Use an `a` host only for navigation.
Every button needs an accessible name. Disabled native buttons use `disabled`; disabled anchors
use `aria-disabled="true"`, leave the tab order, and suppress navigation.

Native button keyboard behavior is preserved: `Enter` and `Space` activate a `button`; links use
native anchor keyboard behavior. The directive does not introduce a custom keyboard model.

## Styles

Import the Kikita UI style entrypoint once:

```scss
@import '@kikita-labs/ui/styles';
```

## Color Tokens

Each appearance reads its own component tokens, so an override set on any ancestor restyles the
buttons below it:

| Appearance         | Fill / hover / active                                                          | Label                 |
| ------------------ | ------------------------------------------------------------------------------ | --------------------- |
| default, `primary` | `--kui-btn-solid-bg`, `--kui-btn-solid-bg-hov`, `--kui-btn-solid-bg-act`       | `--kui-btn-solid-fg`  |
| `danger`           | `--kui-btn-danger-bg`, `--kui-btn-danger-bg-hov`, `--kui-btn-danger-bg-act`    | `--kui-btn-danger-fg` |
| `success`          | `--kui-btn-success-bg`, `--kui-btn-success-bg-hov`, `--kui-btn-success-bg-act` | `--kui-btn-solid-fg`  |
| `warning`          | `--kui-btn-warning-bg`, `--kui-btn-warning-bg-hov`, `--kui-btn-warning-bg-act` | `--kui-btn-solid-fg`  |

The soft, outline and ghost shapes read `--kui-btn-soft-*`, `--kui-btn-outline-*` and
`--kui-btn-ghost-*` for the default appearance, and the matching `--kui-color-<status>-soft-*`
semantic tokens for status appearances. See [tokens.md](tokens.md#removed-in-20) for the
removed `--kui-btn-bg`, `--kui-btn-color` and related aliases.

<!-- geometry-tokens:begin -->

## Geometry Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the scale token in the Default column.

| Token                         | Default                   | Controls           |
| ----------------------------- | ------------------------- | ------------------ |
| `--kui-btn-height-xs`         | `--kui-control-height-xs` | Height, xs         |
| `--kui-btn-padding-inline-xs` | `--kui-space-2`           | Padding, inline xs |
| `--kui-btn-height-sm`         | `--kui-control-height-sm` | Height, sm         |
| `--kui-btn-padding-inline-sm` | `--kui-space-3`           | Padding, inline sm |
| `--kui-btn-height-lg`         | `--kui-control-height-lg` | Height, lg         |
| `--kui-btn-padding-inline-lg` | `--kui-space-5`           | Padding, inline lg |

<!-- geometry-tokens:end -->
