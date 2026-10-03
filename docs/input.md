# Input

`kuiInput` applies Kikita UI styling and optional `kui-field` wiring to a native `<input>`.
It does not replace the browser's input behavior or own form values and validation.

## Usage

Import the directive where it is used:

```ts
import { KuiInputDirective } from '@kikita-labs/ui';
```

Import the Kikita UI runtime styles once in the application entry point:

```ts
import '@kikita-labs/ui/styles';
```

Use the directive on a native input. Add a native label or `aria-label` when the input is not
inside a labelled Field:

```html
<label for="email">Email</label> <input id="email" kuiInput type="email" autocomplete="email" />
```

Inside `kui-field`, the Field supplies the visible label and wires its generated control id,
hint, error, and invalid state:

```html
<kui-field label="Email" hint="Use your work email">
  <input kuiInput type="email" autocomplete="email" />
</kui-field>
```

Use `textarea[kuiTextarea]` for multiline controls. Use the dedicated Kikita UI controls for
specialized number, color, date, selection, and other input behaviors.

## API

The selector is `input[kuiInput]`. `KuiInputDirective` has no outputs, models, content slots,
or component-owned form value.

| Input     | Type                                            | Default and behavior                                                                                                                                                                                                                                                                                                                             |
| --------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `size`    | `KuiSize \| undefined` (`xs`, `sm`, `md`, `lg`) | The `data-kui-size` host attribute resolves local input size, then parent Field effective size, then root `provideKikitaUi({ defaults: { size } })`, then `md`. A Field's effective size resolves its own `size`, `KUI_FIELD_OPTIONS.size`, root default, then `md`. An explicit local Input size takes precedence over its parent Field's size. |
| `invalid` | `boolean`                                       | Defaults to `false` and uses Angular's `booleanAttribute` coercion. When true outside a Signal Forms Field error state, sets `data-kui-invalid` and `aria-invalid="true"`.                                                                                                                                                                       |
| `id`      | `string \| undefined`                           | Omitted inside a Field, uses the Field's generated control id. Omitted outside a Field, no id is added. An explicit value sets the native input id.                                                                                                                                                                                              |

The directive styles a native input; `type`, `value`, `placeholder`, `name`, `disabled`, `readonly`,
`required`, `autocomplete`, and native input constraints remain standard HTML attributes and
properties. Their browser behavior is not a separate `kuiInput` variant.

When an input is inside `kui-field`, avoid overriding its generated id unless you also ensure the
visible label targets that id. The Field label currently targets its generated control id, so an
explicit input id can leave the label's `for` attribute pointing at a different id.

## Forms

For Angular Signal Forms, put `[formField]` on the same native input as `kuiInput`. Wrap it in
`kui-field` when it needs a visible label, hint, error, or required marker:

```html
<kui-field label="Email" hint="Use your work email">
  <input kuiInput type="email" [formField]="profileForm.email" />
</kui-field>
```

Signal Forms owns the value, required and disabled states, touched/dirty state, and validation.
The Field reads the projected form field and displays its required marker and first validation
error according to the Field configuration. `kuiInput` does not add a required constraint or
validation rule.

Signal Forms also supplies raw validity through the native control's `invalid` property. The Field
gates its displayed invalid state on touch; when `[formField]` is present, `kuiInput` follows that
Field state instead of treating the raw `invalid` binding as a manual override. Outside this
Signal Forms case, the `invalid` input can mark a standalone input or reflect a Field error.

## Provider Defaults

Set `defaults.input` once for the application or for a subtree:

```ts
// app.config.ts
provideKikitaUi({
  defaults: {
    input: {
      /* options below */
    },
  },
});

// a component, route or environment injector
providers: [
  kuiProvideDefaults({
    input: {
      /* options below */
    },
  }),
];
```

| Option | Values                         | Description                                                       |
| ------ | ------------------------------ | ----------------------------------------------------------------- |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | Component size. Takes precedence over the global `defaults.size`. |

Each option resolves as `local input > defaults.input.<option> > built-in default`. See [DI defaults](di-defaults.md).

## Accessibility

- Keep the native `<input>` semantics; do not add an ARIA role to it.
- Give every input an accessible name through a `kui-field` label, an associated native `<label>`,
  or `aria-label`. Placeholder text alone is not a label.
- The directive uses the containing Field's control id and references only its currently rendered
  hint and error with `aria-describedby`. The Field exposes a visible error as `role="alert"`.
- `aria-invalid` is omitted when the input is valid. When invalid, the directive sets
  `aria-invalid="true"` and the `data-kui-invalid` styling hook.
- Keep native `disabled` and `readonly` distinct. A disabled input is not available for normal
  interaction; a read-only input remains a native focusable control whose value cannot be edited.
  Required semantics come from native HTML or Signal Forms, not from the Field's visual required
  marker.

## Keyboard

`kuiInput` adds no keyboard handlers. Inputs retain the browser's native Tab focus, text editing,
selection, and type-specific keyboard behavior. Native disabled and read-only behavior also remains
in effect. The visible focus ring is provided by the Input styles.

## CSS hooks

The runtime stylesheet applies the `.kui-input` class. The directive sets `data-kui-size` to the
resolved size and adds `data-kui-invalid` only while invalid. These attributes drive the shipped
size and invalid styles; hover and focus styles use the native `:hover` and `:focus` states. Field
size styles provide a fallback only for descendant `.kui-input` elements without `data-kui-size`,
so an explicitly sized Input keeps its local size inside a differently sized Field.

Input styles consume the shared public variables documented in [Tokens](tokens.md):

| Variable                                                                                                 | Purpose                                                                                 |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `--kui-input-height`, `--kui-input-px`, `--kui-input-radius`                                             | Control height, horizontal padding, and corners.                                        |
| `--kui-input-bg`, `--kui-input-text`, `--kui-input-placeholder`                                          | Surface, text, and placeholder colors.                                                  |
| `--kui-input-border`, `--kui-input-border-hover`, `--kui-input-border-focus`, `--kui-input-border-error` | Resting and state border colors.                                                        |
| `--kui-input-bg-disabled`                                                                                | Disabled surface.                                                                       |
| `--kui-input-focus-ring-color`, `--kui-input-focus-ring`                                                 | Focus outline color (`--kui-color-focus`) and an optional halo shadow (default `none`). |

The Input page should use these library styles and variables without redefining the control's
visual identity. `.kui-input-group` styles are for Field/group composition, not an additional
`kuiInput` input or variant.

<!-- geometry-tokens:begin -->

## Geometry Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the scale token in the Default column.

| Token                      | Default                   | Controls      |
| -------------------------- | ------------------------- | ------------- |
| `--kui-input-font-size`    | `--kui-text-sm-size`      | Font size     |
| `--kui-input-height-xs`    | `--kui-control-height-xs` | Height, xs    |
| `--kui-input-font-size-xs` | `--kui-text-xs-size`      | Font size, xs |
| `--kui-input-height-sm`    | `--kui-control-height-sm` | Height, sm    |
| `--kui-input-height-lg`    | `--kui-control-height-lg` | Height, lg    |
| `--kui-input-font-size-lg` | `--kui-text-base-size`    | Font size, lg |

<!-- geometry-tokens:end -->
