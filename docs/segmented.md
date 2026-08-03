# Segmented

`kui-segmented` is a compound component for exclusive option selection, rendered as a segmented
control with an animated sliding thumb.

## Import

```ts
import { KuiSegmentedComponent, KuiSegmentDirective } from '@kikita-labs/ui';
```

## Usage

```html
<kui-segmented [(value)]="view">
  <button kuiSegment value="list">List</button>
  <button kuiSegment value="grid">Grid</button>
  <button kuiSegment value="calendar">Calendar</button>
</kui-segmented>
```

### Sizes

```html
<kui-segmented size="sm" [(value)]="view">...</kui-segmented>
```

### Signal Forms

`kui-segmented` implements `FormValueControl<string>`, so it takes `[formField]` directly
(it is not a native element, so `[formField]` goes on `kui-segmented` itself, not on `kui-field`):

```html
<kui-field label="View">
  <kui-segmented [formField]="myForm.view">
    <button kuiSegment value="list">List</button>
    <button kuiSegment value="grid">Grid</button>
  </kui-segmented>
</kui-field>
```

## Inputs - `kui-segmented`

- `value`: two-way model - value of the active segment. Bound by `[formField]` or `[(value)]`.
- `selected`: **deprecated**, use `value` instead. Kept in sync with `value` for markup written
  before Signal Forms support existed; planned for removal in the next major version.
- `size`: `xs | sm | md | lg` (default: `md`)
- `disabled`: `boolean` - disables every segment. Set by `[formField]` or directly.
- `invalid`, `errors`, `touched`: set by `[formField]`.

## Inputs - `[kuiSegment]`

- `value`: `string` - identifier for this segment
- `disabled`: `boolean`

## Keyboard

| Key                        | Action                      |
| -------------------------- | --------------------------- |
| `ArrowLeft` / `ArrowRight` | Move focus between segments |
| `Home`                     | Focus first segment         |
| `End`                      | Focus last segment          |
| `Enter` / `Space`          | Select focused segment      |

## Accessibility

- `role="radiogroup"` on `kui-segmented`
- `role="radio"` and `aria-checked` on each segment
- Roving `tabindex`

## Animation

Sliding thumb repositions via `afterEveryRender` using `offsetLeft` / `offsetWidth`. Transition:
`transform` and `width` 220ms. No animation runs on first render.

## CSS Variables

- `--kui-seg-bg`
- `--kui-seg-border`
- `--kui-seg-radius`
- `--kui-seg-padding` (default: `2px`)
- `--kui-seg-gap`
- `--kui-seg-height`
- `--kui-seg-px`
- `--kui-seg-item-radius`
- `--kui-seg-item-gap`
- `--kui-seg-item-bg-active`
- `--kui-seg-fg`
- `--kui-seg-fg-hover`
- `--kui-seg-fg-active`
- `--kui-seg-font-size`
- `--kui-seg-font-weight`
- `--kui-seg-font-weight-active`
