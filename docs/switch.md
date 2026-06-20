# Switch

`kuiSwitch` applies Kikita UI switch styling to native checkbox inputs.

## Import

```ts
import { KuiSwitchDirective } from '@kikita-labs/ui';
```

## Usage

```html
<label>
  <input kuiSwitch type="checkbox" />
  Enable notifications
</label>
```

The directive adds `role="switch"` while keeping the native checkbox input, keyboard behavior, and
form behavior.

## Signal Forms

Use Angular Signal Forms `[formField]` on the same native checkbox:

```html
<label>
  <input kuiSwitch type="checkbox" [formField]="settingsForm.notifications" />
  Enable notifications
</label>
```

For future custom switch components, prefer Angular Signal Forms `FormCheckboxControl` over
CVA-first design.

## Inputs

- `size`: `xs | sm | md | lg`
- `invalid`: marks the switch invalid outside a field error state
- `id`: explicit id override
