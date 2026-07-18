# DI Defaults

Kikita UI uses dependency injection defaults only for repeated design-system decisions that consumers would otherwise copy into many templates.

Do not add a provider default for every input. Prefer local inputs for one-off behavior.

## Layers

```text
local input > scoped component provider > field provider > root provider > component default
```

Use the narrowest layer that matches the consumer need:

- `provideKikitaUi({ defaults: { size } })`: broad application default for size-enabled primitives.
- `kuiProvideFieldOptions(...)`: scoped defaults for `kui-field` and input-like field controls.
- Component providers such as `kuiProvideButtonOptions(...)`: repeated defaults for one primitive family.
- Local inputs: one-off behavior in a specific template.

Density is not a root component default. Configure density through theme seeds because it affects
generated CSS variables:

```ts
provideKikitaUi({
  theme: {
    seeds: {
      density: 'compact',
      // other required seeds...
    },
  },
});
```

## Root Size Defaults

`provideKikitaUi({ defaults: { size } })` applies to public primitives with a `size` input when the local `size` input is omitted.

Components whose size type is narrower than `KuiSize` apply only supported values. For example, `kui-calendar` supports `sm | md`, so a root `size: 'sm'` applies, while `xs` or `lg` is ignored and the calendar keeps `md`.

Do not use root defaults for `kui-icon` because its `size` input is a raw CSS/icon size (`string | number`), not a Kikita control-size preset.

## Field Controls

`KuiFieldControlOptions` is the shared base for input-like controls that expose a clear affordance.

```ts
kuiProvideFieldOptions({ size: 'sm', clearable: true, hideErrors: true });
kuiProvideSelectOptions({ clearable: false, maxVisibleChips: 2 });
kuiProvideComboboxOptions({ clearable: false });
```

Precedence for field and field-control size:

```text
local control size > parent kui-field size > KUI_FIELD_OPTIONS.size > root defaults.size > md
```

Precedence for clearable controls:

```text
local clearable input > component options > KUI_FIELD_OPTIONS.clearable > component default
```

`input[kuiSelect]` and `input[kuiCombobox]` intentionally do not have their own `size` input. They inherit visual size through the parent `kui-field`.

`input[kuiDatePicker]` uses `KUI_FIELD_OPTIONS.clearable` for its clear affordance. Do not add a date-picker-specific provider unless it gains date-picker-specific repeated defaults.

`input[kuiNumberInput]`, `input[kuiColorInput]`, and `input[type=range][kuiSlider]` inherit parent field size when used inside `kui-field`, then fall back to root size defaults. They do not need component-specific provider tokens today.

## Button Primitives

Use one provider for the button family, with separate branches for ordinary buttons and icon-only buttons:

```ts
kuiProvideButtonOptions({
  button: { shape: 'ghost', appearance: 'primary', size: 'sm' },
  iconButton: { shape: 'outline', size: 'sm' },
});
```

Precedence:

```text
local input > KUI_BUTTON_OPTIONS.button/iconButton > root defaults.size > component default
```

Keep the branches separate. `kuiButton` and `kuiIconButton` are both button primitives, but their default shapes are different for good reason (`solid` for ordinary buttons, `ghost` for icon-only buttons).

## Adding A New DI Default

Before adding a provider token or option:

1. Confirm the input represents a repeated design-system choice, not a one-off state.
2. Prefer adding to an existing options interface when the behavior belongs to that family.
3. Keep option interfaces `readonly`.
4. Preserve local-input precedence.
5. Add focused tests for provider precedence.
6. Update the component docs, this page, `docs/architecture.md`, and `CHANGELOG.md`.

Good candidates:

- control size;
- clear affordance defaults;
- button shape/appearance defaults;
- overlay/service defaults such as toast placement or duration.

Poor candidates:

- current selected value;
- loading state;
- disabled/readonly state;
- validation/error state;
- density, which belongs to theme seeds and CSS scopes;
- labels, placeholder text, and accessible names;
- arbitrary visual one-offs better expressed as CSS variables or local inputs.
