# Tooltip

`kuiTooltip` attaches a floating tooltip to any element. Its default adaptive trigger shows it on mouse hover and keyboard focus, and opens it on tap for touch input.

## Import

```ts
import {
  KuiButtonDirective,
  KuiIconButtonDirective,
  KuiIconComponent,
  KuiTooltipDirective,
  KuiTooltipTriggerType,
  kuiProvideDefaults,
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
providers: [
  provideKikitaUi({ defaults: { tooltip: { triggerType: KuiTooltipTriggerType.Auto } } }),
];

// A component or route subtree
providers: [kuiProvideDefaults({ tooltip: { triggerType: KuiTooltipTriggerType.Hover } })];
```

Use `providers` when the default should apply to the component's subtree and projected content.
Use `viewProviders` when it should apply only to the component's own view. A nested level merges with
the parent per property, so it can change `triggerType` without resetting other tooltip defaults.

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

`defaults.tooltip.triggerType` falls back to `KuiTooltipTriggerType.Auto`. Override it globally with
`provideKikitaUi({ defaults: { tooltip: { triggerType: ... } } })`, or in a component provider with
`kuiProvideDefaults({ tooltip: { triggerType: ... } })`. A local `triggerType` input is the narrowest override.

## Migration

The default now opens the existing tooltip surface on touch taps. Set `triggerType="hover"` to
preserve the previous touch-disabled behavior, or `triggerType="none"` to disable the tooltip on
all input devices.

## Provider Defaults

Set `defaults.tooltip` once for the application or for a subtree:

```ts
// app.config.ts
provideKikitaUi({
  defaults: {
    tooltip: {
      /* options below */
    },
  },
});

// a component, route or environment injector
providers: [
  kuiProvideDefaults({
    tooltip: {
      /* options below */
    },
  }),
];
```

| Option        | Values                                   | Description                                                                          |
| ------------- | ---------------------------------------- | ------------------------------------------------------------------------------------ |
| `triggerType` | `KuiTooltipTrigger`                      | Default interaction mode for tooltip triggers. Defaults to adaptive `auto` behavior. |
| `placement`   | `'top' \| 'bottom' \| 'left' \| 'right'` | Preferred side of the trigger.                                                       |
| `offset`      | `number`                                 | Gap in px between the trigger and the tooltip.                                       |

Each option resolves as `local input > defaults.tooltip.<option> > built-in default`. See [DI defaults](di-defaults.md).

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

<!-- geometry-tokens:begin -->

## Geometry Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the scale token in the Default column.

| Token                     | Default              | Controls  |
| ------------------------- | -------------------- | --------- |
| `--kui-tooltip-font-size` | `--kui-text-sm-size` | Font size |

<!-- geometry-tokens:end -->
