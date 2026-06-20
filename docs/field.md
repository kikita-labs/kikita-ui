# Field

`kui-field` wraps a native control with label, hint, error, and required semantics.

## Import

```ts
import { KuiFieldComponent, KuiInputDirective } from '@kikita-labs/ui';
```

## Usage

```html
<kui-field label="Email" hint="Use your work email" required>
  <input kuiInput type="email" />
</kui-field>

<kui-field label="Email" error="Email is required">
  <input kuiInput type="email" />
</kui-field>
```

When `kuiInput` is projected inside `kui-field`, it receives the field id, `aria-describedby`, and invalid state automatically.

## Signal Forms

Bind validation state from Angular Signal Forms into `kui-field`:

```html
<kui-field
  label="Project"
  [required]="profileForm.project().required()"
  [error]="profileForm.project().errors()[0]?.message"
>
  <input kuiInput [formField]="profileForm.project" />
</kui-field>
```

`kui-field` owns label, hint, error text, required marker, and ARIA description wiring. Angular
Signal Forms owns the form state.
