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

## Inputs

- `size`: `xs | sm | md | lg`
- `invalid`: marks the input invalid outside a field error state
- `id`: explicit id override
