# Switch

`kuiSwitch` applies Kikita UI switch styling to native checkbox inputs.

## Import

```ts
import { KuiSwitch } from '@kikita-labs/ui';
```

## Usage

```html
<kui-field label="Notifications" hint="Control product and release notifications">
  <label>
    <input kuiSwitch type="checkbox" />
    Enable notifications
  </label>
</kui-field>
```

The directive adds `role="switch"` while keeping the native checkbox input, keyboard behavior, and
form behavior. Use `kui-field` for field-level label, hint, error, and description wiring; keep a
native label for the switch text itself.

## Signal Forms

Use Angular Signal Forms `[formField]` on the same native checkbox:

```html
<kui-field label="Notifications" hint="Control product and release notifications">
  <label>
    <input kuiSwitch type="checkbox" [formField]="settingsForm.notifications" />
    Enable notifications
  </label>
</kui-field>
```

For future custom switch components, prefer Angular Signal Forms `FormCheckboxControl` over
CVA-first design.

## Inputs

- `size`: `xs | sm | md | lg`; defaults to the parent `kui-field` size, then
  `provideKikitaUi({ defaults.size })`, then `md`
- `invalid`: marks the switch invalid outside a field error state
- `id`: explicit id override

## Provider Defaults

Set `defaults.switch` once for the application or for a subtree:

```ts
// app.config.ts
provideKikitaUi({
  defaults: {
    switch: {
      /* options below */
    },
  },
});

// a component, route or environment injector
providers: [
  provideKuiDefaults({
    switch: {
      /* options below */
    },
  }),
];
```

| Option | Values                         | Description                                                       |
| ------ | ------------------------------ | ----------------------------------------------------------------- |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | Component size. Takes precedence over the global `defaults.size`. |

Each option resolves as `local input > defaults.switch.<option> > built-in default`. See [DI defaults](di-defaults.md).
