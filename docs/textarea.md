# Textarea

`kuiTextarea` applies Kikita UI multiline control styling to native `textarea` elements.

## Import

```ts
import { KuiTextarea } from '@kikita-labs/ui';
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

- `size`: `xs | sm | md | lg`; defaults to the parent `kui-field` size, then
  `provideKikitaUi({ defaults.size })`, then `md`
- `invalid`: marks the textarea invalid outside a field error state
- `id`: explicit id override

<!-- geometry-tokens:begin -->

## Provider Defaults

Set `defaults.textarea` once for the application or for a subtree:

```ts
// app.config.ts
provideKikitaUi({
  defaults: {
    textarea: {
      /* options below */
    },
  },
});

// a component, route or environment injector
providers: [
  provideKuiDefaults({
    textarea: {
      /* options below */
    },
  }),
];
```

| Option | Values                         | Description                                                       |
| ------ | ------------------------------ | ----------------------------------------------------------------- |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | Component size. Takes precedence over the global `defaults.size`. |

Each option resolves as `local input > defaults.textarea.<option> > built-in default`. See [DI defaults](di-defaults.md).

## Geometry Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the scale token in the Default column.

| Token                          | Default         | Controls       |
| ------------------------------ | --------------- | -------------- |
| `--kui-textarea-padding-block` | `--kui-space-3` | Padding, block |

<!-- geometry-tokens:end -->
