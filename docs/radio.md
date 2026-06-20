# Radio

`kuiRadio` applies Kikita UI radio styling to native radio inputs.

## Import

```ts
import { KuiRadioDirective } from '@kikita-labs/ui';
```

## Usage

```html
<div role="radiogroup" aria-label="Plan">
  <label>
    <input kuiRadio type="radio" name="plan" value="starter" />
    Starter
  </label>
  <label>
    <input kuiRadio type="radio" name="plan" value="pro" />
    Pro
  </label>
</div>
```

Use a shared native `name` for mutually exclusive radio choices.

## Signal Forms

Use Angular Signal Forms `[formField]` on each native radio input:

```html
<label>
  <input kuiRadio type="radio" name="plan" value="pro" [formField]="billingForm.plan" />
  Pro
</label>
```

## Inputs

- `size`: `xs | sm | md | lg`
- `invalid`: marks the radio invalid outside a field error state
- `id`: explicit id override
