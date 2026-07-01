# Field

`kui-field` wraps a native control with label, hint, error, and required semantics.

## Import

```ts
import { KuiFieldComponent, KuiInputDirective, kuiProvideFieldOptions } from '@kikita-labs/ui';
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

Use `kui-field` as the default wrapper for input-like controls whenever a visible label, hint,
error, or required marker is needed. Do not hand-wire those pieces around Kikita inputs in docs,
playground pages, or examples.

## Signal Forms

Bind Angular Signal Forms to the native control with `[formField]`:

```html
<kui-field label="Project" hint="Minimum 3 characters">
  <input kuiInput [formField]="profileForm.project" />
</kui-field>
```

`kui-field` owns label, hint, error text, required marker, and ARIA description wiring. Angular
Signal Forms owns the form state. If the projected Kikita control has `[formField]` with a
`required(...)` validator, the required marker is inferred automatically. If the field has errors
with `message` values, the first message is rendered automatically unless `hideErrors` is set.
An explicit `required` input on `kui-field` overrides the inferred state.

```html
<kui-field label="Project" hint="Minimum 3 characters" hideErrors>
  <input kuiInput [formField]="profileForm.project" />
</kui-field>
```

## Projected Content

Use projected marker directives when the label, hint, or error needs custom template logic:

```html
<kui-field>
  <label kuiLabel>Email</label>
  <input kuiInput type="email" [formField]="profileForm.email" />
  <p kuiHint>Use your work email</p>

  @if (shouldShowEmailError()) {
  <p kuiError>Email is required</p>
  }
</kui-field>
```

`kuiLabel`, `kuiHint`, and `kuiError` keep the same field wiring. `kuiError` is manual content:
render it with `@if` when you want custom visibility rules.

Do not use `[hidden]` for custom error visibility. Prefer Angular control flow so the error element
is not rendered unless it should be part of the field semantics.

## Inputs

- `label`: shorthand label text
- `hint`: shorthand hint text
- `error`: explicit error text override
- `hideErrors`: hides automatically inferred Angular Signal Forms error messages
- `required`: explicit required marker override
- `size`: `xs | sm | md | lg`

## Provider Defaults

Use `kuiProvideFieldOptions` for app-wide field defaults:

```ts
providers: [kuiProvideFieldOptions({ size: 'sm', hideErrors: true })];
```

Local inputs always win over provider defaults:

```text
local input > KUI_FIELD_OPTIONS > component default
```

`KUI_FIELD_OPTIONS` is intentionally static configuration. Do not pass writable signals to it.
Runtime density/size switching should be implemented as a dedicated runtime API rather than by
mutating provider option objects.
