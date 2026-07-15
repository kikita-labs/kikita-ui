# Field

`kui-field` wraps a native control with label, hint, error, and required semantics.

## Import

```ts
import {
  KuiFieldComponent,
  KuiInputDirective,
  KuiInputGroupDirective,
  kuiProvideFieldOptions,
} from '@kikita-labs/ui';
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
`hideErrors` hides rendered error messages, including explicit `error` input and projected
`kuiError` content, but keeps invalid state. An explicit `required` input on `kui-field`
overrides the inferred state.

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

## Affixes And Field Actions

Use `.kui-input-group` when a field needs prefix text, suffix text, leading icons, trailing actions,
clear buttons, spinners, or other field chrome around a native input:

```html
<kui-field label="Project URL" hint="The prefix and suffix are visual field chrome.">
  <div class="kui-input-group">
    <span kuiFieldAffix>https://</span>
    <input kuiInput aria-label="Project slug" />
    <span kuiFieldAffix>.dev</span>
  </div>
</kui-field>
```

Import `KuiInputGroupDirective` when using `.kui-input-group`. The directive delegates clicks on
non-interactive field chrome, such as prefix text, suffix text, decorative icons, and empty group
space, to the first enabled native control inside the group. Interactive descendants such as clear
buttons, chevrons, visibility toggles, links, and the control itself keep their own behavior.

Use `kuiFieldAction` for inline field buttons such as clear, password visibility, dropdown
chevron, or custom trailing actions:

```html
<kui-field label="Search">
  <div class="kui-input-group">
    <span kuiFieldAffixIcon>...</span>
    <input kuiInput aria-label="Search query" />
    <button kuiFieldAction type="button" aria-label="Clear search">...</button>
  </div>
</kui-field>
```

`kuiFieldAffix`, `kuiFieldAffixIcon`, and `kuiFieldAction` are directives, not bare CSS classes —
import `KuiFieldAffixDirective`, `KuiFieldAffixIconDirective`, and `KuiFieldActionDirective` from
`@kikita-labs/ui`. `kuiFieldAffixIcon` sets `aria-hidden="true"` for you (it's always decorative).
`kuiFieldAffix` accepts an `emphasis` input (`'default' | 'strong'`) for full-color text instead of
the muted default.

Decorative icons should use `aria-hidden="true"`. Interactive field actions must be native
buttons with accessible names.

## Rich Messages

Projected `kuiHint` and `kuiError` can use `.kui-field-message` for icon + text layouts:

```html
<kui-field>
  <label kuiLabel>API key</label>
  <input kuiInput />
  <p kuiHint class="kui-field-message">
    <span class="kui-field-message-icon" aria-hidden="true">...</span>
    <span>Stored encrypted. <a href="/security">Learn more</a>.</span>
  </p>
</kui-field>
```

Error messages are still part of `aria-describedby` when projected with `kuiError`.

## Inputs

- `label`: shorthand label text
- `hint`: shorthand hint text
- `error`: explicit error text override
- `hideErrors`: hides rendered error messages while keeping invalid state
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

## CSS Classes

- `.kui-input-group`: wraps a native input with field chrome
- `kuiFieldAffix` (`.kui-field-affix` / `.kui-affix`): prefix or suffix text directive
- `kuiFieldAffixIcon` (`.kui-field-affix-icon` / `.kui-affix-icon`): decorative leading or trailing icon directive
- `kuiFieldAction` (`.kui-field-action`): inline field action button directive
- `.kui-field-spinner` / `.kui-affix-spinner`: inline loading indicator
- `.kui-field-message` / `.kui-field__message`: rich hint/error row
- `.kui-field-message-icon` / `.kui-field__message-icon`: icon inside a rich message
- `.kui-field-message--hint` / `.kui-field__message--hint`: hint-colored rich message
- `.kui-field-message--error` / `.kui-field__message--error`: error-colored rich message
