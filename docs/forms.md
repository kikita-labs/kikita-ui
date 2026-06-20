# Forms

Kikita UI is Signal Forms-first.

For native form controls, combine Angular Signal Forms with Kikita directives on the same element:

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
  <kui-field
    label="Email"
    [required]="profileForm.email().required()"
    [error]="profileForm.email().errors()[0]?.message"
  >
    <input kuiInput type="email" [formField]="profileForm.email" />
  </kui-field>
</form>
```

The local Angular 22.0.1 package exposes the native binding selector as `[formField]`.

Custom Kikita form controls should prefer Angular Signal Forms control contracts such as
`FormValueControl` or `FormCheckboxControl`. Do not design new controls CVA-first unless a
compatibility layer is explicitly needed.
