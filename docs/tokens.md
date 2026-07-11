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
| `--kui-seed-warning` | `oklch(0.74 0.16 75)`  | Caution state              |
| `--kui-seed-danger`  | `oklch(0.54 0.22 25)`  | Error/destructive state    |
| `--kui-seed-info`    | `oklch(0.58 0.16 215)` | Informational state        |

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

Step 6 is the seed. Components do not consume these directly.

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
--kui-color-warning-fill
--kui-color-danger-fill
--kui-color-info-fill
```

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

Spacing uses a 4px base:

| Token            |  Value |
| ---------------- | -----: |
| `--kui-space-1`  |  `4px` |
| `--kui-space-2`  |  `8px` |
| `--kui-space-3`  | `12px` |
| `--kui-space-4`  | `16px` |
| `--kui-space-5`  | `20px` |
| `--kui-space-6`  | `24px` |
| `--kui-space-8`  | `32px` |
| `--kui-space-12` | `48px` |
| `--kui-space-16` | `64px` |

## Typography

Typography tokens split size and line-height in implementation, even when docs show shorthand.

| Token             |   Size | Line height | Use           |
| ----------------- | -----: | ----------: | ------------- |
| `--kui-text-xs`   | `11px` |      `1.45` | Caption, hint |
| `--kui-text-sm`   | `13px` |       `1.5` | Button, input |
| `--kui-text-base` | `14px` |       `1.6` | Body          |
| `--kui-text-md`   | `15px` |      `1.55` | Large label   |
| `--kui-text-lg`   | `18px` |       `1.4` | Subheading    |
| `--kui-text-xl`   | `22px` |       `1.3` | Heading       |
| `--kui-text-2xl`  | `28px` |      `1.15` | Title         |
| `--kui-text-3xl`  | `36px` |       `1.1` | Display       |

Letter spacing defaults to `0`.

## Control Height

Shared height scale for interactive controls (Input, Button, Icon-Button, Segmented, Tabs,
Group):

| Token                     |  Value |
| ------------------------- | -----: |
| `--kui-control-height-xs` |  `28px` |
| `--kui-control-height-sm` |  `32px` |
| `--kui-control-height-md` |  `40px` |
| `--kui-control-height-lg` |  `44px` |

Selected via `data-kui-size` (`xs`/`sm`/`md`/`lg`) on the component. This is the only axis that
controls height; `data-kui-density` controls padding only (see Button tokens below).

## Component Tokens

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
--kui-btn-disabled-opacity
--kui-btn-focus-ring-w
--kui-btn-focus-ring-off
--kui-btn-focus-ring-color
```

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
```

Select tokens:

```css
--kui-select-bg
--kui-select-border
--kui-select-border-hover
--kui-select-border-focus
--kui-select-border-error
--kui-select-radius
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

Slider tokens:

```css
--kui-slider-thumb-shadow
--kui-slider-thumb-shadow-hover
--kui-slider-thumb-shadow-focus
--kui-slider-thumb-shadow-active
```
