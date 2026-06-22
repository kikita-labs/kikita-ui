# Tooltip

`kuiTooltip` attaches a floating tooltip to any element. Shown on hover and keyboard focus, hidden on leave and blur.

## Import

```ts
import { KuiTooltipDirective } from '@kikita-labs/ui';
```

## Usage

```html
<button kuiButton [kuiTooltip]="'Save changes'">Save</button>

<button kuiButton [kuiTooltip]="'Delete item'" placement="bottom">Delete</button>
```

The tooltip text is passed as the directive binding value. Empty or whitespace-only strings are ignored — no tooltip is rendered.

## Inputs

- `kuiTooltip`: `string` — tooltip text
- `placement`: `top | bottom | left | right` — preferred placement (default: `top`)

## Behavior

- Appends `<div role="tooltip">` to `<body>` via `position: fixed`.
- Shows on `mouseenter` and `focusin`; hides on `mouseleave` and `focusout`.
- Not shown on touch — use a contextual overlay or tap sheet for mobile.
- Fade-in: 180ms with 3px vertical slide. Fade-out: 120ms.
- `prefers-reduced-motion` disables both animations.
- SSR-safe: tooltip DOM is created only in a browser context.

## CSS Variables

- `--kui-tooltip-py`
- `--kui-tooltip-px`
- `--kui-tooltip-radius`
- `--kui-tooltip-bg`
- `--kui-tooltip-fg`
- `--kui-tooltip-shadow`
