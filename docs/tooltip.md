# Tooltip

`kuiTooltip` attaches a floating tooltip to any element. Its default adaptive trigger shows it on mouse hover and keyboard focus, and opens it on tap for touch input.

## Import

```ts
import {
  KuiButtonDirective,
  KuiIconButtonDirective,
  KuiIconComponent,
  KUI_TOOLTIP_OPTIONS,
  KuiTooltipDirective,
  KuiTooltipTriggerType,
  kuiProvideTooltipOptions,
  provideKikitaUi,
} from '@kikita-labs/ui';
```

## Usage

```html
<button kuiButton [kuiTooltip]="'Save changes'">Save</button>

<button kuiButton [kuiTooltip]="'Delete item'" placement="bottom">Delete</button>
```

The tooltip text is passed as the directive binding value. Empty or whitespace-only strings are ignored, and no tooltip is rendered. `auto` is the default trigger: it uses hover/focus for mouse input and tap for touch input while keeping the tooltip surface and `role="tooltip"`.

For short, non-interactive information triggers, keep the tooltip surface and opt into adaptive tap behavior:

```html
<button
  kuiIconButton
  type="button"
  aria-label="Billing information"
  triggerType="auto"
  [kuiTooltip]="'Your plan renews automatically on the date shown here.'"
>
  <kui-icon name="info" />
</button>
```

Configure the default at application or component scope. The local `triggerType` input takes precedence over the provider:

```ts
// app.config.ts
providers: [provideKikitaUi({ tooltip: { triggerType: KuiTooltipTriggerType.Auto } })];

// A component or route subtree
providers: [kuiProvideTooltipOptions({ triggerType: KuiTooltipTriggerType.Hover })];
```

Use `providers` when the default should apply to the component's subtree and projected content.
Use `viewProviders` when it should apply only to the component's own view. The helper merges with
the nearest parent tooltip options; a direct `KUI_TOOLTIP_OPTIONS` provider replaces the complete
options object at that injector level.

## API

### Inputs

- `kuiTooltip`: `string`, tooltip text
- `placement`: `top | bottom | left | right`, preferred placement (default: `top`)
- `triggerType`: `auto | hover | click | none`, local trigger override

### Behavior

- Appends `<div role="tooltip">` to `<body>` via `position: fixed`.
- `auto` shows on mouse hover and keyboard focus, and toggles on touch tap.
- `hover` shows on mouse hover and keyboard focus, but does not open on touch taps.
- `click` toggles on click or keyboard activation on every input device.
- `none` disables the tooltip.
- Emits `aria-describedby` only while the tooltip element exists, avoiding stale references to removed tooltip ids.
- Tap-open tooltips close on a second tap, outside click, focus moving outside, or Escape.
- Keep tooltip content supplemental and non-interactive. Use a popover or dialog when the content needs links, buttons, or more space.
- Fade-in: 180ms with 3px vertical slide. Fade-out: 120ms.
- `prefers-reduced-motion` disables both animations.
- SSR-safe: tooltip DOM is created only in a browser context.

`KUI_TOOLTIP_OPTIONS` defaults to `{ triggerType: KuiTooltipTriggerType.Auto }`. Override it globally with
`provideKikitaUi({ tooltip: { triggerType: ... } })`, or in a component provider with
`kuiProvideTooltipOptions(...)`. A local `triggerType` input is the narrowest override.

## Migration

The default now opens the existing tooltip surface on touch taps. Set `triggerType="hover"` to
preserve the previous touch-disabled behavior, or `triggerType="none"` to disable the tooltip on
all input devices.

## Accessibility

- Use a native interactive element, normally a `<button>`, for an information trigger.
- Keep tooltip content short, supplemental, and non-interactive.
- The trigger receives `aria-describedby` only while the tooltip is rendered.
- Tap-open tooltips remain available until the user taps again, moves focus outside, taps outside, or presses Escape.

## CSS Variables

- `--kui-tooltip-py`
- `--kui-tooltip-px`
- `--kui-tooltip-radius`
- `--kui-tooltip-bg`
- `--kui-tooltip-fg`
- `--kui-tooltip-shadow`
