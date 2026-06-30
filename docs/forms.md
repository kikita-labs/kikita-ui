# Forms

Kikita UI is Signal Forms-first.

For native form controls, place the Kikita control directive and Angular Signal Forms `[formField]`
on the same native/control element, then wrap it with `kui-field` when the UI needs a visible label,
hint, error, or required marker.

```ts
import { signal } from '@angular/core';
import { email, form, minLength, required } from '@angular/forms/signals';

const model = signal({
  email: '',
  project: '',
});

const profileForm = form(model, (path) => {
  required(path.email, { message: 'Email is required' });
  email(path.email, { message: 'Enter a valid email' });
  required(path.project, { message: 'Project is required' });
  minLength(path.project, 3, { message: 'Use at least 3 characters' });
});
```

```html
<form [formRoot]="profileForm">
  <kui-field label="Email" hint="Use your work email">
    <input kuiInput type="email" [formField]="profileForm.email" />
  </kui-field>
</form>
```

The local Angular 22.0.1 package exposes the native binding selector as `[formField]`.
When a native control with `[formField]` is projected inside `kui-field`, the field wrapper infers
the required marker from Angular Signal Forms `required(...)` metadata and renders the first error
message when one is available. Use explicit `required` on `kui-field` only when the marker should be
forced without a form validator. Use `hideErrors` when the field should keep invalid styling without
rendering automatic error text.

Custom Kikita form controls should prefer Angular Signal Forms control contracts such as
`FormValueControl` or `FormCheckboxControl`. Do not design new controls CVA-first unless a
compatibility layer is explicitly needed.

## Field-First Pattern

Use this default pattern for input-like controls:

```html
<kui-field label="Label" hint="Optional helper text">
  <input kuiInput [formField]="form.field" />
</kui-field>
```

Do not write a separate `<label>`, hint paragraph, error paragraph, required marker, or
`aria-describedby` wiring for normal field usage. `kui-field` owns that wiring.

Use the same pattern for multiline and numeric controls:

```html
<kui-field label="Notes" hint="Internal project notes">
  <textarea kuiTextarea [formField]="form.notes"></textarea>
</kui-field>

<kui-field label="Count" hint="Enter a value from 1 to 100">
  <input type="number" kuiNumberInput [formField]="form.count" />
</kui-field>

<kui-field label="Volume" hint="Use arrow keys, Home, and End">
  <input type="range" kuiSlider [formField]="form.volume" />
</kui-field>
```

For Signal Forms controls, put range constraints in the form schema with `min(...)` and `max(...)`.
Do not add native `min`/`max` attributes to an element that has `[formField]`; Angular binds those
native properties from the schema metadata.

## Custom Field Templates

Use projected marker directives only when the field needs custom template logic:

```html
<kui-field>
  <label kuiLabel>Email</label>
  <input kuiInput type="email" [formField]="profileForm.email" />
  <p kuiHint>Use your work email</p>

  @if (showEmailError()) {
  <p kuiError>Email is required</p>
  }
</kui-field>
```

Do not use `[hidden]` for custom errors. Prefer Angular control flow (`@if`) so hidden error
content is not rendered or referenced by assistive technology.
