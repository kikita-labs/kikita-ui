# Slider

`kuiSlider` applies Kikita UI slider styling and behavior to native range inputs.

## Import

```ts
import { KuiSliderDirective } from '@kikita-labs/ui';
```

## Usage

```html
<kui-field label="Volume" hint="Use arrow keys, Home, and End.">
  <input type="range" kuiSlider min="0" max="100" value="60" />
</kui-field>
```

Use native range input semantics first. For visible labels and helper text, prefer a wrapping
`kui-field` instead of hand-written labels or description ids.
When projected inside `kui-field`, `kuiSlider` inherits the field id, `aria-describedby`,
`aria-invalid`, and visual invalid state.

```html
<input
  type="range"
  kuiSlider
  color="success"
  size="lg"
  minLabel="0"
  maxLabel="100"
  aria-label="Progress"
/>
```

## Signal Forms

Use Angular Signal Forms `[formField]` on the same native range input. Angular owns the native range
value, disabled state, and validation state; `kuiSlider` keeps the generated track/thumb visuals in
sync with the native input.

```html
<kui-field label="Volume" hint="Signal Forms native range binding">
  <input type="range" kuiSlider [formField]="settingsForm.volume" />
</kui-field>
```

Use Angular Signal Forms `min(...)` and `max(...)` validators for range constraints. Do not add
native `min`/`max` attributes to an element that has `[formField]`; Angular binds those native
properties from the schema metadata.

## Inputs

- `color`: `primary | success | danger | neutral`
- `size`: `sm | md | lg`
- `minLabel`: optional label rendered below the start of the track.
- `maxLabel`: optional label rendered below the end of the track.
- `disabled`: mirrors disabled styling on the generated slider wrapper.
- `invalid`: applies invalid styling outside a `kui-field`.
- `id`: explicit native input id. Falls back to the parent `kui-field` control id.

## Tooltip

By default, `kuiSlider` shows the current numeric value in a tooltip over the thumb on hover.

If the host also has a non-empty `kuiTooltip`, the static tooltip text wins and the value tooltip is disabled:

```html
<input type="range" kuiSlider kuiTooltip="Playback speed" />
```

## Styles

Import the Kikita UI style entrypoint once:

```scss
@import '@kikita-labs/ui/styles';
```

Slider styles live in `projects/ui/src/styles/slider.css` and are included through `@kikita-labs/ui/styles`.

<!-- color-tokens:begin -->

## Color Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the semantic role in the Default column.

| Token                                 | Default                         | Controls                   |
| ------------------------------------- | ------------------------------- | -------------------------- |
| `--kui-slider-fill-bg`                | `--kui-color-primary-indicator` | Fill background            |
| `--kui-slider-fill-bg-primary`        | `--kui-color-primary-indicator` | Fill background, primary   |
| `--kui-slider-fill-bg-success`        | `--kui-color-success-indicator` | Fill background, success   |
| `--kui-slider-fill-bg-danger`         | `--kui-color-danger-indicator`  | Fill background, danger    |
| `--kui-slider-fill-bg-neutral`        | `--kui-color-text-secondary`    | Fill background, neutral   |
| `--kui-slider-fill-bg-invalid`        | `--kui-color-danger-indicator`  | Fill background, invalid   |
| `--kui-slider-thumb-bg`               | `--kui-color-primary-indicator` | Thumb background           |
| `--kui-slider-thumb-bg-primary`       | `--kui-color-primary-indicator` | Thumb background, primary  |
| `--kui-slider-thumb-bg-success`       | `--kui-color-success-indicator` | Thumb background, success  |
| `--kui-slider-thumb-bg-danger`        | `--kui-color-danger-indicator`  | Thumb background, danger   |
| `--kui-slider-thumb-bg-neutral`       | `--kui-color-text-secondary`    | Thumb background, neutral  |
| `--kui-slider-thumb-bg-invalid`       | `--kui-color-danger-indicator`  | Thumb background, invalid  |
| `--kui-slider-thumb-focus-ring-color` | `--kui-color-focus`             | Thumb focus outline color  |
| `--kui-slider-track-bg-disabled`      | `--kui-color-surface-elevated`  | Track background, disabled |
| `--kui-slider-fill-bg-disabled`       | `--kui-color-text-disabled`     | Fill background, disabled  |
| `--kui-slider-thumb-bg-disabled`      | `--kui-color-text-disabled`     | Thumb background, disabled |
| `--kui-slider-tooltip-bg`             | `--kui-color-text`              | Tooltip background         |
| `--kui-slider-tooltip-color`          | `--kui-color-bg`                | Tooltip color              |
| `--kui-slider-tooltip-arrow-color`    | `--kui-color-text`              | Tooltip arrow color        |
| `--kui-slider-labels-color`           | `--kui-color-text-secondary`    | Labels color               |

<!-- color-tokens:end -->

<!-- geometry-tokens:begin -->

## Provider Defaults

Set `defaults.slider` once for the application or for a subtree:

```ts
// app.config.ts
provideKikitaUi({
  defaults: {
    slider: {
      /* options below */
    },
  },
});

// a component, route or environment injector
providers: [
  kuiProvideDefaults({
    slider: {
      /* options below */
    },
  }),
];
```

| Option  | Values                                            | Description                                                       |
| ------- | ------------------------------------------------- | ----------------------------------------------------------------- |
| `size`  | `'sm' \| 'md' \| 'lg'`                            | Component size. Takes precedence over the global `defaults.size`. |
| `color` | `'primary' \| 'success' \| 'danger' \| 'neutral'` | Default colour role.                                              |

Each option resolves as `local input > defaults.slider.<option> > built-in default`. See [DI defaults](di-defaults.md).

## Geometry Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the scale token in the Default column.

| Token                                 | Default                    | Controls                                                   |
| ------------------------------------- | -------------------------- | ---------------------------------------------------------- |
| `--kui-slider-tooltip-text-font-size` | `--kui-text-xs-size`       | Tooltip text font size                                     |
| `--kui-slider-labels-font-size`       | `--kui-text-xs-size`       | Labels font size                                           |
| `--kui-slider-thumb-size`             | `18px (sm 14px, lg 22px)`  | Thumb diameter; sets the track inset and the block padding |
| `--kui-slider-thumb-size-active`      | `thumb size + 4px`         | Thumb diameter while pressed                               |
| `--kui-slider-track-size`             | `4px (sm 2px, lg 6px)`     | Track thickness                                            |
| `--kui-slider-thumb-shadow`           | none                       | Thumb shadow at rest                                       |
| `--kui-slider-thumb-shadow-hover`     | halo and 1px 3px black 30% | Thumb shadow on hover                                      |
| `--kui-slider-thumb-shadow-focus`     | 1px 2px black 30%          | Thumb shadow on keyboard focus                             |
| `--kui-slider-thumb-shadow-active`    | 2px 8px black 50% and halo | Thumb shadow while pressed                                 |

<!-- geometry-tokens:end -->
