# Popover

Floating content panel anchored to a trigger element. Unlike Tooltip (text only, hover), Popover supports interactive content and both click and hover triggers. Unlike Dropdown (listbox structure), Popover is a free-content slot.

## Usage

```html
<button [kuiPopoverFor]="myPop" kuiButton>Open</button>

<kui-popover #myPop placement="bottom" [arrow]="true" ariaLabel="Details">
  <div class="kui-popover-title">Title</div>
  <div class="kui-popover-desc">Supporting text.</div>
</kui-popover>
```

## With action buttons

```html
<button [kuiPopoverFor]="confirmPop" kuiButton appearance="danger">Delete</button>

<kui-popover #confirmPop placement="bottom" align="start" [arrow]="true" ariaLabel="Delete record">
  <div class="kui-popover-title">Delete record?</div>
  <div class="kui-popover-desc" style="margin-bottom: 12px">This cannot be undone.</div>
  <div style="display: flex; gap: 8px; justify-content: flex-end">
    <button kuiButton appearance="outline" size="sm" (click)="confirmPop.close()">Cancel</button>
    <button kuiButton appearance="danger" size="sm" (click)="delete()">Delete</button>
  </div>
</kui-popover>
```

## Hover trigger

```html
<button [kuiPopoverFor]="hoverPop" kuiButton>Hover me</button>

<kui-popover #hoverPop placement="top" triggerType="hover" [arrow]="true" ariaLabel="Hover details">
  <div class="kui-popover-desc">Opens on hover. Mouse can travel to the panel.</div>
</kui-popover>
```

## KuiPopoverComponent inputs

| Input         | Type                    | Default     | Description                                                                                             |
| ------------- | ----------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `placement`   | `KuiPopoverPlacement`   | `'bottom'`  | Preferred side. Auto-flips to fit in viewport.                                                          |
| `align`       | `KuiPopoverAlign`       | `'center'`  | Alignment along the anchor edge.                                                                        |
| `arrow`       | `boolean`               | `false`     | Show the arrow caret pointing to the anchor.                                                            |
| `triggerType` | `KuiPopoverTriggerType` | `'click'`   | `click`: toggle on click, close on outside click/ESC. `hover`: open on mouseenter, close on mouseleave. |
| `ariaLabel`   | `string`                | `'Popover'` | Accessible name for the `role="dialog"` panel. Prefer content-specific text.                            |
| `hoverDelay`  | `number`                | `100`       | Delay (ms) before closing on mouseleave; lets the mouse travel to the panel.                            |
| `offset`      | `number`                | `8`         | Gap in px between anchor and panel. Arrow adds 6 px automatically.                                      |
| `trapFocus`   | `boolean`               | `false`     | Focus the first focusable element in the panel on open.                                                 |
| `open`        | `boolean` (model)       | `false`     | Current open state exposed for trigger integrations. Do not use as a standalone controlled API.         |

## KuiPopoverForDirective

Add `[kuiPopoverFor]="ref"` to any element to make it a trigger. Sets `aria-expanded` and `aria-haspopup="dialog"` automatically.

## Types

```ts
type KuiPopoverPlacement = 'top' | 'bottom' | 'left' | 'right';
type KuiPopoverAlign = 'start' | 'center' | 'end';
type KuiPopoverTriggerType = 'click' | 'hover';
```

## Positions

```text
top-start    top-center    top-end
left-start                right-start
left-center   [anchor]    right-center
left-end                  right-end
bottom-start bottom-center bottom-end   <- default
```

12 positions total. Auto-flip to opposite side if the preferred placement would exit the viewport.

## Content helpers

Optional CSS class names for common layouts:

| Class                | Description                                 |
| -------------------- | ------------------------------------------- |
| `.kui-popover-title` | Semi-bold sm text, `margin-bottom: space-2` |
| `.kui-popover-desc`  | Secondary sm text, line-height 1.55         |

All other layout (buttons, forms, images) is developer-provided via `<ng-content>`.

## CSS custom properties

| Token                      | Default                        | Description                                   |
| -------------------------- | ------------------------------ | --------------------------------------------- |
| `--kui-popover-bg`         | `--kui-color-surface-elevated` | Panel background                              |
| `--kui-popover-border`     | `--kui-color-border`           | Border colour                                 |
| `--kui-popover-radius`     | `--kui-radius-lg`              | Corner radius                                 |
| `--kui-popover-shadow`     | `--kui-shadow-lg`              | Drop shadow                                   |
| `--kui-popover-padding-x`  | `--kui-space-4`                | Horizontal padding                            |
| `--kui-popover-padding-y`  | `--kui-space-4`                | Vertical padding                              |
| `--kui-popover-min-width`  | `160px`                        | Minimum panel width                           |
| `--kui-popover-max-width`  | `320px`                        | Maximum panel width                           |
| `--kui-popover-arrow-size` | `10px`                         | Arrow caret size                              |
| `--kui-z-popover`          | `400`                          | z-index (between Dropdown 300 and Dialog 500) |

## Behaviour

- **Click mode:** trigger click toggles open/closed. Click outside or ESC closes. Trigger receives focus back on close.
- **Hover mode:** `mouseenter` on trigger opens. `mouseleave` starts a `hoverDelay` timer. Mouse entering the panel cancels the timer. `mouseleave` on the panel closes.
- **Flip:** CDK `FlexibleConnectedPositionStrategy` prefers stated `placement` and flips to the opposite side if needed. `align` is preserved after flip.
- **No backdrop:** click anywhere outside the panel closes it via document `mousedown` listener.
- **Scroll tracking:** `document scroll` capture reapplies position strategy to keep panel aligned during scroll.
- **Animations:** entry 160 ms ease-out (slide 5 px + fade), exit 120 ms ease-in (slide 4 px + fade). Direction matches `data-side` attribute. `prefers-reduced-motion`: opacity only.
- **Accessibility:** `role="dialog"` and `aria-label` on panel, `aria-expanded` on trigger, ESC returns focus to trigger. Override `ariaLabel` with content-specific text when possible.

## Architecture

`KuiPopoverComponent` lazily creates a CDK overlay on `openFor()` and disposes it after the exit animation completes. The `[kuiPopoverFor]` directive wires click/hover events on the trigger element and passes `element.nativeElement` to `openFor()`. Position changes from CDK update `data-side`/`data-align` attributes driving animation and arrow direction.
