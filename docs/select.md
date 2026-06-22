# Select

`kuiSelect` applies Kikita UI select styling to native `<select>` elements. Integrates with `kui-field` for label, hint, error, and ARIA wiring.

## Import

```ts
import { KuiSelectDirective } from '@kikita-labs/ui';
```

## Usage

```html
<kui-field label="Country">
  <select kuiSelect>
    <option value="">Choose a country…</option>
    <option value="us">United States</option>
    <option value="gb">United Kingdom</option>
  </select>
</kui-field>
```

### Standalone

```html
<select kuiSelect size="sm">
  <option value="a">Option A</option>
  <option value="b">Option B</option>
</select>
```

### Error state

```html
<kui-field label="Role" error="Role is required" required>
  <select kuiSelect invalid>
    <option value="">Select a role…</option>
  </select>
</kui-field>
```

## Inputs

- `size`: `xs | sm | md | lg` (default: `md`)
- `invalid`: `boolean` — marks the control as invalid outside a `kui-field` error state

## Field wiring

When placed inside `kui-field`, `kuiSelect` automatically receives:

- `id` from the field's generated `controlId`
- `aria-describedby` pointing to the field's hint and error elements
- `aria-invalid` when the field is in error state

## CSS Variables

- `--kui-select-height`
- `--kui-select-px`
- `--kui-select-chevron-gap`
- `--kui-select-chevron-size`
- `--kui-select-chevron-inset`
- `--kui-select-bg`
- `--kui-select-border`
- `--kui-select-border-width`
- `--kui-select-border-hover`
- `--kui-select-border-focus`
- `--kui-select-border-error`
- `--kui-select-focus-ring`
- `--kui-select-fg`
- `--kui-select-radius`
- `--kui-select-font-size`
