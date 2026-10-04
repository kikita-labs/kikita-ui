# Tokens

Kikita UI exposes native CSS custom properties as the runtime theming contract.

SCSS may generate styles, but SCSS variables are not public API.

## Naming

All public CSS variables use the `--kui-*` prefix.

Token layers:

```text
seed -> palette -> semantic -> component
```

## Color Seeds

Required color seeds:

| Token                | Ember value            | Purpose                    |
| -------------------- | ---------------------- | -------------------------- |
| `--kui-seed-primary` | `oklch(0.52 0.25 285)` | Brand/action color         |
| `--kui-seed-neutral` | `oklch(0.5 0.01 80)`   | Surface, border, text base |
| `--kui-seed-success` | `oklch(0.54 0.16 145)` | Positive state             |
| `--kui-seed-warning` | `oklch(0.56 0.15 65)`  | Caution state              |
| `--kui-seed-danger`  | `oklch(0.54 0.22 25)`  | Error/destructive state    |
| `--kui-seed-info`    | `oklch(0.53 0.14 215)` | Informational state        |

## Palette Tokens

Generated palette names:

```css
--kui-primary-1 ... --kui-primary-12
--kui-neutral-1 ... --kui-neutral-12
--kui-success-1 ... --kui-success-12
--kui-warning-1 ... --kui-warning-12
--kui-danger-1 ... --kui-danger-12
--kui-info-1 ... --kui-info-12
```

Step 6 is the seed. Steps 1 to 5 and 7 to 12 of an accent sit at fixed tones (CIE L\*: 97, 92, 85, 74,
62, the seed, 33, 22, 11, 4, 2, 0.5), so the contrast between two steps depends on their distance and
not on the hue: steps whose tones differ by at least 51 reach 4.5:1, by at least 40 reach 3:1.

The neutral palette is two scales of twelve steps, one per mode, tinted with the hue and chroma of
`--kui-seed-neutral`. `--kui-neutral-1` to `--kui-neutral-12` are defined in the light and in the
dark block and differ between them; the light scale runs from white (step 1) to the text step (12),
the dark scale from the deepest surface (1) to the text step (12). `theme.palettes.neutral` is the
light scale.

| Step | Light-mode job                       | Dark-mode job                         |
| ---- | ------------------------------------ | ------------------------------------- |
| 1    | soft background                      | -                                     |
| 2    | soft background hover                | -                                     |
| 3    | soft background active               | -                                     |
| 4    | soft border                          | -                                     |
| 5    | -                                    | solid fill (tone 62 for every seed)   |
| 6    | solid fill (the seed)                | -                                     |
| 7    | indicator when the fill is too light | -                                     |
| 8    | soft text, text and icons            | soft border                           |
| 9-11 | -                                    | soft background (active, hover, rest) |
| 12   | spare                                | spare                                 |

Components do not consume these directly: a style under `projects/ui/src`
that reads a palette step or a `--kui-seed-*` variable fails `pnpm audit:static`. Add or reuse a
semantic token instead (see [theming.md](theming.md#overriding-tokens) for override scopes).

## Semantic Tokens

Surface:

```css
--kui-color-bg
--kui-color-surface
--kui-color-surface-elevated
--kui-color-surface-sunken
--kui-color-border
--kui-color-border-strong
```

Text:

```css
--kui-color-text
--kui-color-text-secondary
--kui-color-text-disabled
```

Primary:

```css
--kui-color-primary-fill
--kui-color-primary-fill-hover
--kui-color-primary-fill-active
--kui-color-primary-soft-bg
--kui-color-primary-soft-bg-hover
--kui-color-primary-soft-bg-active
--kui-color-primary-soft-text
--kui-color-primary-focus-ring
```

Status:

```css
--kui-color-success-fill
--kui-color-success-fill-hover
--kui-color-success-fill-active
--kui-color-warning-fill
--kui-color-warning-fill-hover
--kui-color-warning-fill-active
--kui-color-danger-fill
--kui-color-danger-fill-hover
--kui-color-danger-fill-active
--kui-color-danger-soft-bg
--kui-color-danger-soft-bg-hover
--kui-color-danger-soft-bg-active
--kui-color-info-fill
```

Overlay:

```css
--kui-color-scrim /* black at 50%: behind Dialog, Drawer and Command Palette */
--kui-color-scrim-strong /* black at 92%: behind the fullscreen Media Viewer */
--kui-color-on-scrim /* white: text and icons over a scrim */
```

## Solid Fill, Indicator And Text Roles

Every accent (`primary`, `success`, `warning`, `danger`, `info`) has these roles; the ones marked
generated depend on the seed, the others are references to ramp steps:

| Role                                                       | Meaning                                                                                                                                             |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--kui-color-<role>-fill`                                  | Solid background: the seed in both modes (slightly corrected when no text colour reaches 4.5:1 on it).                                              |
| `--kui-color-<role>-on-fill` (generated)                   | White or near-black text and icons on the fill, whichever reads better (at least 4.5:1).                                                            |
| `--kui-color-<role>-fill-away` (generated)                 | Black when the on-fill is light, white when it is dark.                                                                                             |
| `--kui-color-<role>-fill-hover`, `-fill-active`            | The fill mixed with the away colour (light 18% and 36%, dark 28% toward the away colour and 8% toward black), so contrast never drops.              |
| `--kui-color-<role>-indicator` (generated)                 | Border, outline, mark, spinner or status dot: the fill when it reaches 3:1 on every surface of the mode, step 7 (light) or step 5 (dark) otherwise. |
| `--kui-color-<role>-text`                                  | Text and icon colour on a surface (at least 4.5:1): step 8 in light mode, step 4 in dark mode.                                                      |
| `--kui-color-<role>-soft-bg`, `-soft-text`, `-soft-border` | Tinted background with its text and border.                                                                                                         |

Neutral and shared roles:

```css
--kui-color-neutral-fill
--kui-color-neutral-on-fill
--kui-color-border-control
--kui-color-border-control-hover
--kui-color-text-placeholder
--kui-color-on-scrim
--kui-color-state-hover
--kui-color-state-active
--kui-color-focus
```

`--kui-color-border-control` is the boundary of an interactive control at rest (at least 3:1 on every
surface); `--kui-color-border-control-hover` is its hover colour; `--kui-color-border` and
`--kui-color-border-strong` stay for dividers and cards.
`--kui-color-text-placeholder` reaches 4.5:1 on every surface; `--kui-color-text-disabled` is only for
disabled controls. `--kui-color-on-scrim` is white in both modes for text over overlays.
`--kui-color-state-hover` and `--kui-color-state-active` are translucent layers of the text colour (8% and
14%) for the hover and pressed fill of list items, menu items, calendar days, tabs and ghost buttons: they
lighten the surface in dark mode and darken it in light mode, on any surface, so a hover never disappears.
`--kui-color-focus` is the colour of the 2px focus outline and defaults to the primary indicator.

A fill is a background colour only: text and icons read `-text`, borders and marks read `-indicator`.
To recolour a solid inside a subtree, override the fill together with `-on-fill`, `-fill-away` and
`-indicator`, or set a different seed through the provider.

Deprecated: `--kui-color-on-fill` (a constant white; use `--kui-color-<role>-on-fill`) and
`--kui-color-primary-focus-ring` (a translucent halo; use `--kui-color-focus`). Both are removed in
3.0.

## Radius

Ember radius scale:

| Token               |    Value |
| ------------------- | -------: |
| `--kui-radius-none` |      `0` |
| `--kui-radius-xs`   |    `4px` |
| `--kui-radius-sm`   |    `6px` |
| `--kui-radius-md`   |    `8px` |
| `--kui-radius-lg`   |   `10px` |
| `--kui-radius-xl`   |   `14px` |
| `--kui-radius-full` | `9999px` |

## Spacing

Spacing uses a 4px base, with 2px and 6px half steps for tight gaps and padding:

| Token             |  Value |
| ----------------- | -----: |
| `--kui-space-0-5` |  `2px` |
| `--kui-space-1`   |  `4px` |
| `--kui-space-1-5` |  `6px` |
| `--kui-space-2`   |  `8px` |
| `--kui-space-3`   | `12px` |
| `--kui-space-4`   | `16px` |
| `--kui-space-5`   | `20px` |
| `--kui-space-6`   | `24px` |
| `--kui-space-8`   | `32px` |
| `--kui-space-12`  | `48px` |
| `--kui-space-16`  | `64px` |

## Typography

Typography has two layers: raw text-size tokens and semantic type-role tokens.

Raw size tokens:

| Token                  |   Size |
| ---------------------- | -----: |
| `--kui-text-2xs-size`  |  `9px` |
| `--kui-text-xs-size`   | `11px` |
| `--kui-text-sm-size`   | `13px` |
| `--kui-text-base-size` | `14px` |
| `--kui-text-md-size`   | `15px` |
| `--kui-text-lg-size`   | `18px` |
| `--kui-text-xl-size`   | `22px` |
| `--kui-text-2xl-size`  | `28px` |
| `--kui-text-3xl-size`  | `36px` |

Font weight tokens:

```css
--kui-font-weight-regular
--kui-font-weight-medium
--kui-font-weight-semibold
--kui-font-weight-bold
```

Semantic role tokens:

```css
--kui-type-display-size
--kui-type-display-line-height
--kui-type-display-weight
```

The same `size` / `line-height` / `weight` triplet exists for `heading-lg`, `heading-md`,
`heading-sm`, `title`, `body-lg`, `body`, `body-sm`, `caption`, `overline`, and `code`.

Runtime typography classes are available from `@kikita-labs/ui/styles`: `.kui-display`,
`.kui-heading-lg`, `.kui-heading-md`, `.kui-heading-sm`, `.kui-title`, `.kui-body-lg`,
`.kui-body`, `.kui-body-sm`, `.kui-caption`, `.kui-overline`, and `.kui-code`.

Tone utility classes are color-only: `.kui-text-default`, `.kui-text-muted`,
`.kui-text-disabled`, `.kui-text-primary`, `.kui-text-success`, `.kui-text-warning`, and
`.kui-text-danger`.

Letter spacing defaults to `0`. `--kui-type-overline-letter-spacing` (`0.06em`) is the tracking of
uppercase overline text: `.kui-overline`, table headers and listbox group labels. It is in `em`, so a
user stylesheet that sets letter spacing for WCAG 1.4.12 keeps working.

Line height: headings, titles and body copy read the `--kui-type-*-line-height` roles.
`--kui-line-height-control` (`1.3`) is the line height of single-line control and label text
(inputs, field labels, menu items). Component weight tokens (`--kui-btn-font-weight`,
`--kui-tab-font-weight`, `--kui-badge-font-weight`, ...) default to the four `--kui-font-weight-*`
tokens in CSS, so changing `--kui-font-weight-semibold` restyles every part that uses it.

## Control Height

Shared height scale for interactive controls (Input, Button, Icon-Button, Segmented, Tabs,
Group):

| Token                     |  Value |
| ------------------------- | -----: |
| `--kui-control-height-xs` | `28px` |
| `--kui-control-height-sm` | `32px` |
| `--kui-control-height-md` | `40px` |
| `--kui-control-height-lg` | `44px` |

Selected via `data-kui-size` (`xs`/`sm`/`md`/`lg`) on the component. This is the only axis that
controls height; `data-kui-density` controls padding only (see Button tokens below).

## Shared Tokens

These global tokens are the single knob for a behaviour the whole library shares. A component hook
(`--kui-btn-focus-ring-w`, `--kui-chip-disabled-opacity`, `--kui-dialog-backdrop`, ...) is read first
and defaults to the global token in the component's own CSS, so a value set on any ancestor wins and
a change to the global token reaches every component that has not been overridden. The generated
stylesheet does not define the component hooks, so a global token set on a subtree is never shadowed
by a copy of its value on `:root`.

### Motion

| Token                   |                         Default | Use                                                |
| ----------------------- | ------------------------------: | -------------------------------------------------- |
| `--kui-duration-fast`   |                         `100ms` | Hover and colour changes                           |
| `--kui-duration-quick`  |                         `120ms` | Exit animations                                    |
| `--kui-duration-base`   |                         `160ms` | Enter animations and control state changes         |
| `--kui-duration-normal` |                         `200ms` | Moving indicators, backdrops, progress             |
| `--kui-ease`            | `cubic-bezier(0.16, 1, 0.3, 1)` | Entering and moving                                |
| `--kui-ease-exit`       |    `cubic-bezier(0.4, 0, 1, 1)` | Leaving: shorter and accelerating, never lingering |

Loops keep their own tokens: `--kui-loader-duration`, `--kui-loader-duration-reduced` (Loader and Tree
spinner with reduced motion), `--kui-skeleton-duration`, `--kui-field-spinner-duration`.

### Focus ring

| Token                           | Default | Use                                                                                                                             |
| ------------------------------- | ------: | ------------------------------------------------------------------------------------------------------------------------------- |
| `--kui-focus-ring-width`        |   `3px` | Standalone controls: Button, Icon Button, Checkbox, Radio, Switch, Tab, Segmented, Card, Chip, Avatar, Table sort and selection |
| `--kui-focus-ring-width-sm`     |   `2px` | Parts inside a composite: links, calendar and picker cells, rows, options, field actions, chip remove                           |
| `--kui-focus-ring-offset`       |   `2px` | Gap between the element and an outer ring                                                                                       |
| `--kui-focus-ring-offset-inset` |  `-2px` | Ring drawn inside rows, cells and options that sit in a scroll container                                                        |

The ring colour is `--kui-color-focus`; every part also has a `-focus-ring-color` hook. Input, Number
Input and the Color Input fields draw an outline of `--kui-input-border-width-focus`. Both widths are at
least the 2px that WCAG 2.2 (2.4.13) asks for.

### Disabled

`--kui-opacity-disabled` (`0.5`) dims every disabled control, row, cell and option: Button, Icon Button,
Segmented, Tabs, Field action, Chip, Color Input swatch, File Upload, Checkbox, Radio, Switch, Input,
Number Input, Calendar day, Time Picker option and Listbox option. The hooks
`--kui-btn-disabled-opacity`, `--kui-chip-disabled-opacity` and `--kui-field-action-disabled-opacity`
override it for one component. Disabled text additionally reads `--kui-color-text-disabled`. Decorative
de-emphasis (a breadcrumb separator, a sort glyph) is not a disabled state and keeps its own value.

### Borders

| Token                         | Default | Use                                                                    |
| ----------------------------- | ------: | ---------------------------------------------------------------------- |
| `--kui-border-width-hairline` |   `1px` | Borders and dividers                                                   |
| `--kui-border-width-thick`    | `1.5px` | Today marker, thick separators                                         |
| `--kui-border-width-heavy`    |   `2px` | Indicator bars, step circles, dashed dropzone borders, spinner strokes |

### Scrim

`--kui-color-scrim` is the layer behind Dialog, Drawer and Command Palette; their hooks
`--kui-dialog-backdrop`, `--kui-drawer-backdrop-bg` and `--kui-command-backdrop-bg` default to it.
`--kui-color-scrim-strong` backs the Media Viewer. Both are black with alpha in both modes.

## Icons

Two public tokens control the line of stroke-based icons: the structural icons that components draw
for themselves and `kui-icon` content. Set them on `:root` or on any subtree. See
[Structural Icons](structural-icons.md#stroke-width).

| Token                      | Values                       | Default                                                                                           |
| -------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------- |
| `--kui-icon-stroke-width`  | A number in glyph-grid units | Structural icons: the weight of their call site (1.5 to 2.5). `kui-icon`: the icon's own weight.  |
| `--kui-icon-vector-effect` | `none`, `non-scaling-stroke` | `none`: the stroke scales with the icon. `non-scaling-stroke` keeps it the same number of pixels. |

The `--kui-icon-size-*` presets are listed on the [Icon](icon.md) page.

## Component Tokens

Component tokens are inputs: set them on an element or its ancestors to restyle one component part.
Each component declares the default in its own CSS as a fallback chain that ends at a semantic or
base token, so the generated stylesheet does not define alias tokens such as `--kui-card-bg`. The
lists below name the available tokens; they are not variables that exist on `:root`.
The generated stylesheet defines only literal component tokens (for example `--kui-btn-gap`),
the semantic `--kui-type-*` roles and the density-dependent `--kui-btn-px`. Read a component token in your own CSS only with a fallback.

Every color part of a public component has its own component token whose default is the semantic
role the part used before. Names follow `--kui-<component>-<part>-<property>[-<state>]`, where the
property is `bg`, `color` (text or icon), `border` or `focus-ring-color`, and the state is a suffix
such as `hover`, `selected` or `invalid`. Each component page lists its tokens in a "Color Tokens"
section; `pnpm audit:static` fails when a style reads a semantic color role without one.

Radius, font size, height, gap and padding of a component part follow the same pattern, for example
`--kui-calendar-radius` and `--kui-file-upload-dropzone-gap`, and are listed in each component's
"Geometry Tokens" section. A size variant (`xs`, `sm`, `lg`) has its own suffixed token, such as
`--kui-input-height-lg`; a square control uses one `-size` token for width and height.

A component keeps its per-variant defaults in private variables (`--_kui-*`) and reads the public token
first, so a value set on any ancestor wins over the variant default. `pnpm audit:static` fails when a
component style defines a public `--kui-*` token itself, except for the tokens a component deliberately
assigns to the controls it contains (Button Group sizes, density, parent-to-child assignments).

`--kui-btn-height` resolves to `--kui-control-height-md` and is overridden per instance by
`[data-kui-size='xs'|'sm'|'lg']` (see Control Height below). `data-kui-density` only rebinds
`--kui-btn-px`/`--kui-input-px`; it does not affect height.

Button tokens:

```css
--kui-btn-px-compact
--kui-btn-px-regular
--kui-btn-px-comfortable
--kui-btn-height
--kui-btn-px
--kui-btn-radius
--kui-btn-gap
--kui-btn-font-size
--kui-btn-font-weight
--kui-btn-solid-bg
--kui-btn-solid-bg-hov
--kui-btn-solid-bg-act
--kui-btn-solid-fg
--kui-btn-soft-bg
--kui-btn-soft-bg-hov
--kui-btn-soft-bg-act
--kui-btn-soft-fg
--kui-btn-outline-border
--kui-btn-outline-fg
--kui-btn-outline-bg-hov
--kui-btn-outline-bg-act
--kui-btn-ghost-fg
--kui-btn-ghost-bg-hov
--kui-btn-ghost-bg-act
--kui-btn-danger-bg
--kui-btn-danger-bg-hov
--kui-btn-danger-bg-act
--kui-btn-danger-fg
--kui-btn-success-bg
--kui-btn-success-bg-hov
--kui-btn-success-bg-act
--kui-btn-warning-bg
--kui-btn-warning-bg-hov
--kui-btn-warning-bg-act
--kui-btn-disabled-opacity
--kui-btn-focus-ring-w
--kui-btn-focus-ring-off
--kui-btn-focus-ring-color
```

`appearance="primary"` and the default appearance read `--kui-btn-solid-*` and `--kui-btn-soft-*`;
`danger`, `success` and `warning` read the matching `--kui-btn-<appearance>-bg*` token (and
`--kui-btn-danger-fg` for the solid label). Icon Button reads the same tokens.

Skeleton tokens:

```css
--kui-color-skeleton-bg
--kui-color-skeleton-highlight
--kui-skeleton-bg
--kui-skeleton-highlight
--kui-skeleton-radius
--kui-skeleton-radius-pill
--kui-skeleton-duration
--kui-skeleton-line-height
--kui-skeleton-heading-height
--kui-skeleton-gap
```

Scrollbar tokens:

```css
--kui-scrollbar-size
--kui-scrollbar-radius
--kui-scrollbar-track
--kui-scrollbar-thumb-min
--kui-scrollbar-thumb-inset
--kui-color-scrollbar-thumb
--kui-color-scrollbar-thumb-hover
--kui-color-scrollbar-thumb-active
```

Empty State tokens:

```css
--kui-empty-padding
--kui-empty-padding-sm
--kui-empty-padding-lg
--kui-empty-gap
--kui-empty-body-gap
--kui-empty-actions-gap
--kui-empty-max-width
--kui-empty-max-width-lg
--kui-empty-icon-size-sm
--kui-empty-icon-size-md
--kui-empty-icon-size-lg
--kui-empty-icon-color
--kui-empty-title-color
--kui-empty-title-size
--kui-empty-title-weight
--kui-empty-description-color
--kui-empty-description-size
```

Field and input tokens:

```css
--kui-field-gap
--kui-field-label-row
--kui-field-control-row
--kui-field-message-row
--kui-field-message-min-height
--kui-field-label-size
--kui-field-label-weight
--kui-field-label-color
--kui-field-hint-color
--kui-field-error-color
--kui-field-required-color
--kui-field-affix-gap
--kui-field-affix-text
--kui-field-affix-text-muted
--kui-field-affix-icon-size
--kui-field-affix-max-inline-size
--kui-field-message-gap
--kui-field-message-icon-size
--kui-field-message-icon-offset
--kui-field-spinner-size
--kui-field-spinner-border-width
--kui-field-spinner-border
--kui-field-spinner-border-active
--kui-field-spinner-duration
--kui-field-spinner-duration-reduced
--kui-field-action-size
--kui-field-action-icon-size
--kui-field-action-radius
--kui-field-action-color
--kui-field-action-color-hover
--kui-field-action-color-active
--kui-field-action-bg-hover
--kui-field-action-bg-active
--kui-field-action-focus-ring-width
--kui-field-action-focus-ring-color
--kui-field-action-disabled-opacity
--kui-input-height
--kui-input-px
--kui-input-radius
--kui-input-bg
--kui-input-bg-disabled
--kui-input-border
--kui-input-border-hover
--kui-input-border-focus
--kui-input-border-error
--kui-input-border-width
--kui-input-border-width-focus
--kui-input-text
--kui-input-placeholder
--kui-input-focus-ring
--kui-input-focus-ring-color
```

Select tokens:

```css
--kui-select-affordance-size
--kui-select-suffix-inline-end
--kui-select-suffix-gap
--kui-select-chip-layer-inline-start
--kui-select-chip-layer-inline-end
--kui-select-chip-layer-gap
```

Combobox tokens:

```css
--kui-combobox-suffix-gap
--kui-combobox-affordance-size
--kui-combobox-loader-size
--kui-combobox-loader-border-width
--kui-combobox-loader-duration
--kui-combobox-highlight-radius
--kui-combobox-highlight-bg
--kui-combobox-highlight-text
```

Command Palette tokens:

```css
--kui-command-bg
--kui-command-border
--kui-command-radius
--kui-command-shadow
--kui-command-backdrop-bg
--kui-command-width
--kui-command-max-height
--kui-command-offset-block-start
--kui-command-search-height
--kui-command-search-gap
--kui-command-list-max-height
--kui-command-item-height
--kui-command-item-gap
--kui-command-item-bg-hover
--kui-command-item-bg-active
--kui-command-item-text
--kui-command-item-text-muted
--kui-command-item-text-danger
--kui-command-shortcut-bg
--kui-command-shortcut-text
--kui-command-footer-text
--kui-z-command-palette
```

Layering tokens:

Library overlays (Dialog, Drawer, Command Palette, Dropdown, Menu, Popover, Tooltip) are shown in the
browser top layer, where `z-index` has no effect and the overlay opened last is on top. The Toast
region joins the top layer too and is raised above any open overlay, so a toast is never hidden
behind a dialog. The `--kui-z-*` tokens only order the layers in a browser without the Popover API:

```css
--kui-z-command-palette /* 460 */
--kui-z-popover         /* 400 */
--kui-z-menu            /* 420 */
--kui-z-drawer-backdrop /* 500 */
--kui-z-drawer          /* 510 */
--kui-z-dialog          /* 520 */
--kui-z-dropdown        /* 1000 */
--kui-z-overlay         /* 1000, the CDK overlay container */
--kui-z-toast           /* 1100 */
--kui-z-tooltip         /* 9000 */
```

Slider tokens:

```css
--kui-slider-thumb-shadow
--kui-slider-thumb-shadow-hover
--kui-slider-thumb-shadow-focus
--kui-slider-thumb-focus-ring-color
--kui-slider-thumb-shadow-active
```

## Defaults That Moved Into CSS

These tokens are still valid hooks: set one on an element or an ancestor to override a single
component. They are no longer defined on `:root`, because a literal copy of a global value there would
shadow a change to the global token. Each one now defaults to the token in the last column.

| Hook                                                                                                                                                                                                                                                                                                                            | Default                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `--kui-btn-focus-ring-w`, `--kui-checkbox-focus-ring-w`, `--kui-radio-focus-ring-w`, `--kui-switch-focus-ring-w`, `--kui-avatar-focus-ring-w`, `--kui-chip-focus-ring-width`                                                                                                                                                    | `--kui-focus-ring-width`     |
| `--kui-chip-remove-focus-ring-width`, `--kui-field-action-focus-ring-width`                                                                                                                                                                                                                                                     | `--kui-focus-ring-width-sm`  |
| `--kui-btn-focus-ring-off`, `--kui-checkbox-focus-ring-off`, `--kui-radio-focus-ring-off`, `--kui-switch-focus-ring-off`, `--kui-avatar-focus-ring-off`                                                                                                                                                                         | `--kui-focus-ring-offset`    |
| `--kui-btn-disabled-opacity`, `--kui-chip-disabled-opacity` (was `0.4`), `--kui-field-action-disabled-opacity`                                                                                                                                                                                                                  | `--kui-opacity-disabled`     |
| `--kui-dialog-backdrop`, `--kui-drawer-backdrop-bg`, `--kui-command-backdrop-bg`                                                                                                                                                                                                                                                | `--kui-color-scrim`          |
| `--kui-btn-font-weight`, `--kui-tab-font-weight`, `--kui-seg-font-weight`, `--kui-menu-item-font-weight`                                                                                                                                                                                                                        | `--kui-font-weight-medium`   |
| `--kui-tab-font-weight-active`, `--kui-seg-font-weight-active`, `--kui-badge-font-weight`, `--kui-avatar-font-weight`, `--kui-chip-font-weight`, `--kui-field-label-weight`, `--kui-menu-group-header-font-weight`, `--kui-drawer-title-weight`, `--kui-breadcrumb-font-weight-current`, `--kui-empty-title-weight` (was `650`) | `--kui-font-weight-semibold` |
| `--kui-chip-avatar-font-weight`                                                                                                                                                                                                                                                                                                 | `--kui-font-weight-bold`     |

Card, Segmented, Tabs and Table no longer read the Button hooks `--kui-btn-focus-ring-w` and
`--kui-btn-focus-ring-off`; set `--kui-focus-ring-width` and `--kui-focus-ring-offset` to change every
ring at once.

## Removed In 2.0

These generated tokens are gone. Nothing in Kikita UI read them any more; set the replacement.

| Removed token                  | Replacement                                                |
| ------------------------------ | ---------------------------------------------------------- |
| `--kui-btn-bg`                 | `--kui-btn-solid-bg`                                       |
| `--kui-btn-bg-hover`           | `--kui-btn-solid-bg-hov`                                   |
| `--kui-btn-bg-active`          | `--kui-btn-solid-bg-act`                                   |
| `--kui-btn-color`              | `--kui-btn-solid-fg`                                       |
| `--kui-btn-secondary-bg`       | `--kui-btn-soft-bg`                                        |
| `--kui-btn-secondary-bg-hover` | `--kui-btn-soft-bg-hov`                                    |
| `--kui-btn-secondary-color`    | `--kui-btn-soft-fg`                                        |
| `--kui-btn-outline-bg-hover`   | `--kui-btn-outline-bg-hov`                                 |
| `--kui-btn-ghost-bg-hover`     | `--kui-btn-ghost-bg-hov`                                   |
| `--kui-btn-focus-ring-width`   | `--kui-btn-focus-ring-w`                                   |
| `--kui-btn-focus-ring-offset`  | `--kui-btn-focus-ring-off`                                 |
| `--kui-btn-focus-ring`         | `outline` built from `--kui-btn-focus-ring-w` and `-color` |
| `--kui-select-bg`              | `--kui-input-bg`                                           |
| `--kui-select-border`          | `--kui-input-border`                                       |
| `--kui-select-border-hover`    | `--kui-input-border-hover`                                 |
| `--kui-select-border-focus`    | `--kui-input-border-focus`                                 |
| `--kui-select-border-error`    | `--kui-input-border-error`                                 |
| `--kui-select-radius`          | `--kui-input-radius`                                       |
