# Number Input

`kuiNumberInput` applies Kikita UI number-input styling and increment/decrement
controls to a native `input[type=number]` element.

## Import

```ts
import { KuiNumberInputDirective } from '@kikita-labs/ui';
```

## Usage

```html
<!-- Standalone -->
<input type="number" kuiNumberInput min="0" max="100" aria-label="Quantity" />

<!-- With ngModel -->
<input type="number" kuiNumberInput min="1" max="99" [(ngModel)]="qty" aria-label="Quantity" />

<!-- In a kui-field -->
<kui-field label="Count" hint="Enter a value from 1 to 100">
  <input type="number" kuiNumberInput min="1" max="100" [(ngModel)]="qty" />
</kui-field>
```

Variant B, with minus/plus controls on the sides, is the default and recommended
for most use cases. Variant A uses stacked arrows on the right and is more compact.

```html
<input type="number" kuiNumberInput variant="a" min="0" max="99" [(ngModel)]="qty" />
```

## Inputs

| Input     | Type                   | Default | Notes                                                                  |
| --------- | ---------------------- | ------- | ---------------------------------------------------------------------- |
| `size`    | `'sm' \| 'md' \| 'lg'` | `'md'`  | Control height from `--kui-control-height-*`. Buttons scale to match.  |
| `variant` | `'a' \| 'b'`           | `'b'`   | B uses side controls; A uses stacked controls on the right.            |
| `invalid` | `boolean`              | `false` | Applies error border. Also inherited from parent `kui-field` error.    |
| `id`      | `string`               | none    | Id override. Falls back to `kui-field` control id when inside a field. |

Standard HTML attributes (`min`, `max`, `step`, `disabled`, `readonly`, `value`)
are placed directly on the native input and work without extra directive inputs.

## Behavior

- Click a generated button to step by the `step` attribute, or by 1 when `step` is omitted.
- Press and hold a generated button for repeated stepping after a 400 ms delay.
- Press Enter or Space on a focused generated button to step once.
- At min, the decrement button is disabled and gets `aria-disabled="true"`.
- At max, the increment button is disabled and gets `aria-disabled="true"`.
- Disabled native inputs set `data-kui-disabled` on the container and disable both buttons.
- Readonly native inputs set `data-kui-readonly` on the container and disable both buttons.
- Native keyboard behavior on the input remains available: ArrowUp, ArrowDown, Home, and End.

## Signal Forms

Use Angular Signal Forms `[formField]` on the same native input:

```html
<kui-field label="Count" hint="Enter a value from 1 to 100">
  <input type="number" kuiNumberInput [formField]="profileForm.count" />
</kui-field>
```

When projected inside `kui-field`, the field wrapper reads the descendant `[formField]` and infers
the required marker and first error message from Angular Signal Forms metadata.

Use Angular Signal Forms `min(...)` and `max(...)` validators for range constraints. Do not add
native `min`/`max` attributes to an element that has `[formField]`; Angular binds those native
properties from the schema metadata.

## Accessibility

- The native `input[type=number]` keeps its built-in keyboard and screen-reader semantics.
- Generated buttons use `aria-label="Decrease value"` and `aria-label="Increase value"`.
- Generated buttons use native `disabled` plus `aria-disabled="true"` when stepping is not available.
- Place the input inside `kui-field` to inherit label, hint, error, and id wiring.

## Styles

Import the Kikita UI style entrypoint once:

```scss
@import '@kikita-labs/ui/styles';
```

Number-input styles live in `projects/ui/src/styles/number-input.css` and are
included through `@kikita-labs/ui/styles`.

## CSS Custom Properties

| Property                          | Default                        | Description                        |
| --------------------------------- | ------------------------------ | ---------------------------------- |
| `--kui-number-input-border`       | `--kui-color-border`           | Border color in default state      |
| `--kui-number-input-divider`      | `--kui-color-border`           | Divider between buttons and input  |
| `--kui-number-input-btn-bg`       | `transparent`                  | Button background in default state |
| `--kui-number-input-btn-bg-hover` | `--kui-color-surface-elevated` | Button background on hover         |
| `--kui-number-input-btn-text`     | `--kui-color-text-secondary`   | Button icon color                  |
