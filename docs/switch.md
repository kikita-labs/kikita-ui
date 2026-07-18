# Switch

`kuiSwitch` applies Kikita UI switch styling to native checkbox inputs.

## Import

```ts
import { KuiSwitchDirective } from '@kikita-labs/ui';
```

## Usage

```html
<kui-field label="Notifications" hint="Control product and release notifications">
  <label>
    <input kuiSwitch type="checkbox" />
    Enable notifications
  </label>
</kui-field>
```

The directive adds `role="switch"` while keeping the native checkbox input, keyboard behavior, and
form behavior. Use `kui-field` for field-level label, hint, error, and description wiring; keep a
native label for the switch text itself.

## Signal Forms

Use Angular Signal Forms `[formField]` on the same native checkbox:

```html
<kui-field label="Notifications" hint="Control product and release notifications">
  <label>
    <input kuiSwitch type="checkbox" [formField]="settingsForm.notifications" />
    Enable notifications
  </label>
</kui-field>
```

For future custom switch components, prefer Angular Signal Forms `FormCheckboxControl` over
CVA-first design.

## Inputs

- `size`: `xs | sm | md | lg`; defaults to the parent `kui-field` size, then
  `provideKikitaUi({ defaults.size })`, then `md`
- `invalid`: marks the switch invalid outside a field error state
- `id`: explicit id override
