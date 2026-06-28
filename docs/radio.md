# Radio

`kuiRadio` applies Kikita UI radio styling to native radio inputs.

## Import

```ts
import { KuiRadioDirective } from '@kikita-labs/ui';
```

## Usage

```html
<kui-field label="Plan" hint="Choose a billing plan">
  <div role="radiogroup">
    <label>
      <input kuiRadio type="radio" name="plan" value="starter" />
      Starter
    </label>
    <label>
      <input kuiRadio type="radio" name="plan" value="pro" />
      Pro
    </label>
  </div>
</kui-field>
```

Use a shared native `name` for mutually exclusive radio choices. Use `kui-field` for the
field-level label, hint, error, and description wiring; keep native labels for each option.

## Signal Forms

Use Angular Signal Forms `[formField]` on each native radio input:

```html
<kui-field label="Plan" hint="Choose a billing plan">
  <label>
    <input kuiRadio type="radio" name="plan" value="pro" [formField]="billingForm.plan" />
    Pro
  </label>
</kui-field>
```

## Inputs

- `size`: `xs | sm | md | lg`
- `invalid`: marks the radio invalid outside a field error state
- `id`: explicit id override
