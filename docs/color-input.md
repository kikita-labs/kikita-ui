# Color Input

`kuiColorInput` styles a native text input for editing one color value and opens
the Kikita color picker body from the swatch or chevron trigger.

The first supported use case is the Kikita UI docs theme playground: visitors can
edit Ember seed colors as hex or OKLCH values and feed those strings into
`createKuiTheme()`.

## Import

```ts
import { KuiColorInputDirective } from '@kikita-labs/ui';
```

## Usage

```html
<kui-field label="Primary seed" hint="Hex or oklch().">
  <input kuiColorInput value="#5b4fe0" />
</kui-field>
```

OKLCH values are accepted as text seed values:

```html
<kui-field label="Primary seed">
  <input kuiColorInput value="oklch(0.52 0.25 285)" />
</kui-field>
```

Hex values also enable the browser-native color picker from the swatch button:

```html
<kui-field label="Danger seed">
  <input kuiColorInput value="#e0002a" />
</kui-field>
```

## Inputs

| Input         | Type                           | Default               | Notes                                                                  |
| ------------- | ------------------------------ | --------------------- | ---------------------------------------------------------------------- |
| `size`        | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'`                | Control height from Kikita size tokens.                                |
| `invalid`     | `boolean`                      | `false`               | Applies error border. Also inherited from parent `kui-field` error.    |
| `id`          | `string`                       | none                  | Id override. Falls back to `kui-field` control id when inside a field. |
| `swatchLabel` | `string`                       | `'Open color picker'` | Accessible label prefix for the swatch button.                         |

Standard native input attributes (`value`, `disabled`, `readonly`, `placeholder`,
`autocomplete`, `[formField]`, `[(ngModel)]`, and reactive forms bindings) stay
on the same input.

## Supported Values

- `#rgb`
- `#rrggbb`
- `oklch(L C H)`
- `oklch(L C H / A)`

Empty input is treated as neutral, not invalid. Unsupported non-empty strings set
`aria-invalid="true"` and `data-kui-invalid` on the wrapper.

## Behavior

- The native text input remains the source of truth for forms and validation.
- The swatch previews the current valid value.
- The swatch and chevron open a Kikita popover picker.
- Typing in the text input never opens or closes the picker.
- The popover includes a 2D lightness/chroma surface, hue slider, L/C/H inputs,
  large swatch, hex input, seed presets, and copy action.
- Picking from the popover writes a hex value to the input and dispatches native
  `input` and `change` events.
- Disabled and readonly inputs disable the swatch button.
- Invalid text keeps the last valid swatch color and still allows the picker to
  open.

## Signal Forms

Use `[formField]` on the same native input:

```html
<kui-field label="Primary seed" hint="Hex or oklch().">
  <input kuiColorInput [formField]="themeForm.primary" />
</kui-field>
```

`kui-field` keeps the label, required marker, hint, error, and
`aria-describedby` wiring.

## Accessibility

- The control uses a native text input for editable value semantics.
- The swatch is a native button with an accessible name containing the current
  value.
- The chevron is a native button and rotates while the picker is open.
- The 2D surface exposes slider semantics and supports arrow-key changes.
- The hue control is a native range input.
- The swatch focus ring is visible and does not shift layout.
- Invalid state is exposed through `aria-invalid`.
- Place the input inside `kui-field` for label and description wiring.

## Styles

Import the Kikita UI style entrypoint once:

```scss
@import '@kikita-labs/ui/styles';
```

Color-input styles live in `projects/ui/src/styles/color-input.css` and are
included through `@kikita-labs/ui/styles`.

## CSS Custom Properties

| Property                                | Default                      | Description               |
| --------------------------------------- | ---------------------------- | ------------------------- |
| `--kui-color-input-swatch-size-xs`      | `16px`                       | Swatch size for xs fields |
| `--kui-color-input-swatch-size`         | `20px`                       | Default swatch size       |
| `--kui-color-input-swatch-size-lg`      | `24px`                       | Swatch size for lg fields |
| `--kui-color-input-swatch-radius`       | `--kui-radius-sm`            | Swatch radius             |
| `--kui-color-input-swatch-border`       | `--kui-color-border`         | Swatch border             |
| `--kui-color-input-swatch-border-hover` | `--kui-color-border-strong`  | Swatch hover border       |
| `--kui-color-input-checker`             | `--kui-color-surface-sunken` | Checkerboard color        |
| `--kui-color-input-checker-size`        | `8px`                        | Checkerboard tile size    |
| `--kui-color-input-picker-width`        | `260px`                      | Picker popover width      |
| `--kui-color-input-picker-height`       | `160px`                      | 2D surface height         |
| `--kui-color-input-picker-radius`       | `--kui-radius-md`            | 2D surface radius         |
| `--kui-color-input-preview-swatch-size` | `48px`                       | Picker preview swatch     |
| `--kui-color-input-thumb-size`          | `16px`                       | 2D thumb diameter         |
| `--kui-color-input-hue-track-height`    | `12px`                       | Hue slider track height   |
