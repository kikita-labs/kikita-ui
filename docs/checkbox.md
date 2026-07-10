# Checkbox

`kuiCheckbox` applies Kikita UI checkbox styling to native checkbox inputs.

## Import

```ts
import { KuiCheckboxDirective } from '@kikita-labs/ui';
```

## Usage

```html
<kui-field label="Notifications" hint="Control product and release emails">
  <label>
    <input kuiCheckbox type="checkbox" />
    Receive updates
  </label>
</kui-field>
```

Inside `kui-field`, `kuiCheckbox` receives the field id, `aria-describedby`, and invalid state
automatically. Keep the native label around the checkbox for the option text itself.

## Signal Forms

Use Angular Signal Forms `[formField]` on the same native checkbox:

```html
<kui-field label="Notifications" hint="Control product and release emails">
  <label>
    <input kuiCheckbox type="checkbox" [formField]="settingsForm.receiveUpdates" />
    Receive updates
  </label>
</kui-field>
```

For future custom checkbox-like components, prefer Angular Signal Forms `FormCheckboxControl` over
CVA-first design.

## Inputs

- `size`: `xs | sm | md | lg`
- `invalid`: marks the checkbox invalid outside a field error state
- `id`: explicit id override

## Indeterminate

`.kui-checkbox` styles the native `:indeterminate` pseudo-class (a dash mark
instead of a checkmark). `indeterminate` is a DOM property, not an HTML
attribute, so set it imperatively on the element (`kui-tree`'s checkable mode
does this for parent nodes with a partially checked subtree).
