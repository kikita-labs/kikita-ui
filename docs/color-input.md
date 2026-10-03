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

| Input         | Type                           | Default                         | Notes                                                                  |
| ------------- | ------------------------------ | ------------------------------- | ---------------------------------------------------------------------- |
| `size`        | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'`                          | Control height from Kikita size tokens.                                |
| `invalid`     | `boolean`                      | `false`                         | Applies error border. Also inherited from parent `kui-field` error.    |
| `id`          | `string`                       | none                            | Id override. Falls back to `kui-field` control id when inside a field. |
| `swatchLabel` | `string`                       | `colorInput.openPicker` message | Accessible label prefix for the swatch button.                         |

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
- During server rendering the directive leaves the native input in its template
  position. It adds the picker controls in the browser after the view is created
  so Angular can hydrate the server markup before the directive wraps the input.

## Signal Forms

Use `[formField]` on the same native input:

```html
<kui-field label="Primary seed" hint="Hex or oklch().">
  <input kuiColorInput [formField]="themeForm.primary" />
</kui-field>
```

`kui-field` keeps the label, required marker, hint, error, and
`aria-describedby` wiring.

## Provider Defaults

Set `defaults.colorInput` once for the application or for a subtree:

```ts
// app.config.ts
provideKikitaUi({
  defaults: {
    colorInput: {
      /* options below */
    },
  },
});

// a component, route or environment injector
providers: [
  kuiProvideDefaults({
    colorInput: {
      /* options below */
    },
  }),
];
```

| Option        | Values                         | Description                                                                                                                    |
| ------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `size`        | `'xs' \| 'sm' \| 'md' \| 'lg'` | Component size. Takes precedence over the global `defaults.size`.                                                              |
| `chevronIcon` | `KuiIconGlyph`                 | Icon of the options toggle. Takes precedence over `defaults.icons.pickerChevron`. See [Structural Icons](structural-icons.md). |

Each option resolves as `local input > defaults.colorInput.<option> > built-in default`. See [DI defaults](di-defaults.md).

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

<!-- color-tokens:begin -->

## Color Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the semantic role in the Default column.

| Token                                       | Default                      | Controls                   |
| ------------------------------------------- | ---------------------------- | -------------------------- |
| `--kui-color-input-trigger-color-expanded`  | `--kui-color-primary-fill`   | Trigger color, expanded    |
| `--kui-color-input-popover-color`           | `--kui-color-text`           | Popover color              |
| `--kui-color-input-picker-focus-ring-color` | `--kui-color-focus`          | Picker focus ring color    |
| `--kui-color-input-hue-thumb-bg`            | `--kui-color-on-scrim`       | Hue thumb background       |
| `--kui-color-input-hue-thumb-ring-color`    | `--kui-color-surface`        | Hue thumb ring color       |
| `--kui-color-input-thumb-shadow`            | ring and 1px 3px black 45%   | Color field thumb shadow   |
| `--kui-color-input-hue-thumb-shadow`        | 1px 3px black 45% and ring   | Hue thumb shadow           |
| `--kui-color-input-num-label-color`         | `--kui-color-text-secondary` | Num label color            |
| `--kui-color-input-field-color`             | `--kui-color-text`           | Field color                |
| `--kui-color-input-field-border-focus`      | `--kui-color-primary-fill`   | Field border color, focus  |
| `--kui-color-input-field-focus-ring-color`  | `--kui-color-focus`          | Field focus ring color     |
| `--kui-color-input-preset-border`           | `--kui-color-border`         | Preset border color        |
| `--kui-color-input-preset-focus-ring-color` | `--kui-color-focus`          | Preset focus ring color    |
| `--kui-color-input-hue-focus-ring-color`    | `--kui-color-focus`          | Hue thumb focus ring color |
| `--kui-color-input-checker-bg`              | `--kui-color-surface`        | Checker background         |

<!-- color-tokens:end -->

<!-- geometry-tokens:begin -->

## Geometry Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the scale token in the Default column.

| Token                                   | Default              | Controls                 |
| --------------------------------------- | -------------------- | ------------------------ |
| `--kui-color-input-popover-padding`     | `--kui-space-3`      | Popover padding          |
| `--kui-color-input-thumb-radius`        | `--kui-radius-full`  | Thumb corner radius      |
| `--kui-color-input-hue-track-radius`    | `--kui-radius-full`  | Hue track corner radius  |
| `--kui-color-input-hue-thumb-radius`    | `--kui-radius-full`  | Hue thumb corner radius  |
| `--kui-color-input-nums-gap`            | `--kui-space-2`      | Nums gap                 |
| `--kui-color-input-num-label-font-size` | `--kui-text-xs-size` | Num label font size      |
| `--kui-color-input-field-font-size`     | `--kui-text-xs-size` | Field font size          |
| `--kui-color-input-field-radius`        | `--kui-radius-sm`    | Field corner radius      |
| `--kui-color-input-preview-row-gap`     | `--kui-space-3`      | Preview row gap          |
| `--kui-color-input-swatch-radius-lg`    | `--kui-radius-md`    | Swatch corner radius, lg |
| `--kui-color-input-presets-gap`         | `--kui-space-2`      | Presets gap              |
| `--kui-color-input-preset-radius`       | `--kui-radius-sm`    | Preset corner radius     |

<!-- geometry-tokens:end -->
