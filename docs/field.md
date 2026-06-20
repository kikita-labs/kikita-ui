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
