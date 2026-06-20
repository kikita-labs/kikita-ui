# Checkbox

`kuiCheckbox` applies Kikita UI checkbox styling to native checkbox inputs.

## Import

```ts
import { KuiCheckboxDirective } from '@kikita-labs/ui';
```

## Usage

```html
<label>
  <input kuiCheckbox type="checkbox" />
  Receive updates
</label>
```

Inside `kui-field`, `kuiCheckbox` receives the field id, `aria-describedby`, and invalid state
automatically.

## Signal Forms

Use Angular Signal Forms `[formField]` on the same native checkbox:

```html
<label>
  <input kuiCheckbox type="checkbox" [formField]="settingsForm.receiveUpdates" />
  Receive updates
</label>
```

For future custom checkbox-like components, prefer Angular Signal Forms `FormCheckboxControl` over
CVA-first design.

## Inputs

- `size`: `xs | sm | md | lg`
- `invalid`: marks the checkbox invalid outside a field error state
- `id`: explicit id override
