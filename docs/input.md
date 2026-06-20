# Input

`kuiInput` applies Kikita UI input styling to native `input` and `textarea` elements.

## Import

```ts
import { KuiInputDirective } from '@kikita-labs/ui';
```

## Usage

```html
<input kuiInput placeholder="Email" /> <textarea kuiInput placeholder="Message"></textarea>
```

Inside `kui-field`, `kuiInput` automatically wires label, hint, error, and invalid ARIA attributes.

## Signal Forms

Use Angular Signal Forms `[formField]` on the same native element:

```html
<kui-field label="Email" [error]="emailError()">
  <input kuiInput type="email" [formField]="profileForm.email" />
</kui-field>
```

`kuiInput` stays a native input/textarea styling directive. The Angular Signal Forms directive owns
the field value, required state, disabled state, touched/dirty state, and validation pipeline.

## Inputs

- `size`: `xs | sm | md | lg`
- `invalid`: marks the input invalid outside a field error state
- `id`: explicit id override
