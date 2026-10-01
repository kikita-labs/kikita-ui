# Stepper

`kui-stepper` is a progress indicator for a multi-step process (onboarding, checkout, wizard setup). It projects `kui-step` children; each step computes its own visual state (`done` / `current` / `upcoming` / `disabled` / `error`) from its position relative to `currentIndex`.

## Import

```ts
import { KuiStepperComponent, KuiStepComponent } from '@kikita-labs/ui';
```

## Usage

```html
<kui-stepper [(currentIndex)]="step" aria-label="Progress">
  <kui-step label="Account" />
  <kui-step label="Workspace" />
  <kui-step label="Invite team" />
</kui-stepper>
```

### Vertical Orientation

```html
<kui-stepper orientation="vertical" [(currentIndex)]="step" aria-label="Progress">
  <kui-step label="Account details" description="Name, email, password" />
  <kui-step label="Workspace setup" description="Team name and logo" />
</kui-stepper>
```

### Error State

```html
<kui-stepper [currentIndex]="1" aria-label="Progress">
  <kui-step label="Account" />
  <kui-step label="Payment" description="Card declined" [hasError]="true" />
  <kui-step label="Confirm" />
</kui-stepper>
```

Steps after an errored step automatically render as `disabled`.

### Compact

```html
<kui-stepper compact [(currentIndex)]="step" aria-label="Progress">
  <kui-step label="Account" />
  <kui-step label="Workspace" />
  <kui-step label="Invite team" />
</kui-stepper>
```

## Inputs - `kui-stepper`

- `orientation`: `horizontal | vertical` (default: `horizontal`)
- `size`: `sm | md | lg` (default: `md`)
- `currentIndex`: two-way model, `number` (default: `0`)
- `linear`: `boolean` (default: `true`). When `true`, only completed steps can be clicked to go back. When `false`, upcoming steps can also be clicked to jump forward.
- `compact`: `boolean` (default: `false`). Renders dots only, no labels or descriptions.

## Inputs - `kui-step`

- `label`: `string`
- `description`: `string`, optional secondary line under the label
- `hasError`: `boolean` (default: `false`). Renders this step as `error` and disables every step after it.
- `disabled`: `boolean` (default: `false`). Forces this step to render as `disabled` regardless of position.

State (`done` / `current` / `upcoming` / `disabled` / `error`) is derived automatically and cannot be set directly.

## Accessibility

- `kui-stepper` renders `role="list"`; each `kui-step` renders `role="listitem"`.
- The current step has `aria-current="step"`.
- Completed steps (and, when `linear` is `false`, upcoming steps) render their circle as a native `<button>` with an accessible name (`Back to step X` / `Go to step X`).
- Disabled and non-interactive steps render a plain `<span>`, out of tab order.
- Connector lines are decorative (`aria-hidden="true"`).
- Pass `aria-label` on the host, for example `aria-label="Progress"`.

## CSS Variables

- `--kui-stepper-connector-color`
- `--kui-stepper-connector-color-done`
- `--kui-stepper-circle-size`
- `--kui-stepper-fg-upcoming`
- `--kui-stepper-fg-current`
- `--kui-stepper-fg-done`
- `--kui-stepper-fg-error`

## Style Import

Import `@kikita-labs/ui/styles` (which includes `stepper.css`) once in your application styles.

<!-- color-tokens:begin -->

## Color Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the semantic role in the Default column.

| Token                                   | Default                          | Controls                      |
| --------------------------------------- | -------------------------------- | ----------------------------- |
| `--kui-stepper-label-color-hover`       | `--kui-color-text`               | Label color, hover            |
| `--kui-stepper-circle-focus-ring-color` | `--kui-color-primary-focus-ring` | Circle focus ring color       |
| `--kui-stepper-label-color`             | `--kui-color-text-secondary`     | Label color                   |
| `--kui-stepper-description-color`       | `--kui-color-text-secondary`     | Description color             |
| `--kui-stepper-circle-color-done`       | `--kui-color-on-fill`            | Circle color, done            |
| `--kui-stepper-label-color-done`        | `--kui-color-text`               | Label color, done             |
| `--kui-stepper-circle-bg-current`       | `--kui-color-surface`            | Circle background, current    |
| `--kui-stepper-label-color-current`     | `--kui-color-text`               | Label color, current          |
| `--kui-stepper-circle-bg-upcoming`      | `--kui-color-surface-elevated`   | Circle background, upcoming   |
| `--kui-stepper-circle-border-upcoming`  | `--kui-color-border`             | Circle border color, upcoming |
| `--kui-stepper-circle-bg-disabled`      | `--kui-color-surface-elevated`   | Circle background, disabled   |
| `--kui-stepper-circle-border-disabled`  | `--kui-color-border`             | Circle border color, disabled |
| `--kui-stepper-circle-color-disabled`   | `--kui-color-text-disabled`      | Circle color, disabled        |
| `--kui-stepper-label-color-disabled`    | `--kui-color-text-disabled`      | Label color, disabled         |
| `--kui-stepper-circle-color-error`      | `--kui-color-on-fill`            | Circle color, error           |
| `--kui-stepper-circle-bg-compact`       | `--kui-color-border`             | Circle background, compact    |

<!-- color-tokens:end -->

<!-- geometry-tokens:begin -->

## Geometry Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the scale token in the Default column.

| Token                                        | Default                | Controls                      |
| -------------------------------------------- | ---------------------- | ----------------------------- |
| `--kui-stepper-gap-vertical`                 | `--kui-space-3`        | Gap, vertical                 |
| `--kui-stepper-body-padding-bottom-vertical` | `--kui-space-5`        | Body padding, bottom vertical |
| `--kui-stepper-circle-font-size`             | `--kui-text-sm-size`   | Circle font size              |
| `--kui-stepper-label-font-size`              | `--kui-text-sm-size`   | Label font size               |
| `--kui-stepper-description-font-size`        | `--kui-text-xs-size`   | Description font size         |
| `--kui-stepper-circle-font-size-sm`          | `--kui-text-xs-size`   | Circle font size, sm          |
| `--kui-stepper-label-font-size-sm`           | `--kui-text-xs-size`   | Label font size, sm           |
| `--kui-stepper-circle-font-size-lg`          | `--kui-text-base-size` | Circle font size, lg          |
| `--kui-stepper-label-font-size-lg`           | `--kui-text-base-size` | Label font size, lg           |

<!-- geometry-tokens:end -->
