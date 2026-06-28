# Textarea

`kuiTextarea` applies Kikita UI multiline control styling to native `textarea` elements.

## Import

```ts
import { KuiTextareaDirective } from '@kikita-labs/ui';
```

## Usage

```html
<kui-field label="Notes" hint="Internal project note">
  <textarea kuiTextarea rows="4" placeholder="Write a note"></textarea>
</kui-field>
```

## Signal Forms

Use Angular Signal Forms `[formField]` on the same native textarea:

```html
<kui-field label="Description" hint="Short project description">
  <textarea kuiTextarea [formField]="profileForm.description"></textarea>
</kui-field>
```

`kuiTextarea` owns visual styling and ARIA description wiring through `kui-field`. Angular Signal
Forms owns the value, disabled state, touched/dirty state, and validation pipeline. When projected
inside `kui-field`, the field wrapper reads the descendant `[formField]` and infers the required
marker and first error message from Angular Signal Forms metadata.

## Inputs

- `size`: `xs | sm | md | lg`
- `invalid`: marks the textarea invalid outside a field error state
- `id`: explicit id override
