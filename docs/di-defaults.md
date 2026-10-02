# DI Defaults

Kikita UI lets an application set defaults once, for the whole app or for a subtree, instead of
repeating them in every template. Defaults cover preferences shared by many instances (size, shape,
clearable, toast placement). Data, instance state and forms state are never defaults.

Customization has several levers; defaults are only one of them:

| What you want to change                    | Use                                  |
| ------------------------------------------ | ------------------------------------ |
| Colour, radius, spacing, type              | Theme seeds and CSS variables        |
| Variant or behaviour shared across the app | Defaults (this page)                 |
| Density                                    | Theme seeds (`seeds.density`)        |
| Texts and accessible names                 | Per-instance inputs; i18n is planned |

## Setting defaults

```ts
// app.config.ts
provideKikitaUi({
  defaults: {
    size: 'sm',
    button: { shape: 'ghost', size: 'md' },
    select: { clearable: true, maxVisibleChips: 2 },
    toast: { position: 'top-end', duration: 4000 },
  },
});
```

```ts
// A component, route or environment injector: applies to that subtree only
providers: [kuiProvideDefaults({ button: { size: 'lg' } })];
```

`defaults` is a flat map with one key per primitive plus the global control `size`. Every key points
to a named options interface (`KuiButtonOptions`, `KuiIconButtonOptions`, `KuiFieldOptions`,
`KuiSelectOptions`, `KuiComboboxOptions`, `KuiDatePickerOptions`, `KuiTimePickerOptions`,
`KuiTooltipOptions`, `KuiToastOptions`). `KuiComponentDefaults` lists every key. Interfaces that share
a meaning share a base (`KuiButtonBaseOptions`, `KuiFieldControlOptions`).

## Layers and merging

```text
local input > nearest level > parent levels > provideKikitaUi defaults > component default
```

Each injector level adds a layer. A level is merged over the defaults it inherits **per component
key and per property**:

- an omitted or `undefined` property inherits from the parent;
- `false`, `0`, `''` and `null` are real values and override;
- arrays and functions are replaced as a whole;
- a level never changes its parent.

Several `kuiProvideDefaults` or `provideKikitaUi` providers on one level combine in provider order,
the later one winning per property.

## Reactive values

Every property accepts a plain value or a `Signal`. The whole `defaults` value may also be a function
that runs in an injection context, which is how defaults depend on a service:

```ts
@Service()
class ThemeState {
  readonly shape = signal<KuiButtonShape>('solid');
}

provideKikitaUi({
  defaults: () => ({ button: { shape: inject(ThemeState).shape } }),
});
```

Components read the effective value in `computed`, so changing the signal updates every affected
component. A component's `providers` array cannot read `this` (a decorator cannot see the
instance); put the state in a service and read it in a function.

To change defaults at runtime without a signal, inject `KuiDefaults`:

```ts
const defaults = inject(KuiDefaults);

defaults.set('button', { shape: 'outline' }); // merges into this level's own layer
defaults.update('select', (current) => ({ clearable: !current?.clearable }));
defaults.get('button'); // Signal of the effective button options
```

`set` and `update` write to the nearest level only. `KuiDefaults` never exposes a writable signal.

Some options are read once. Toast `position` and `maxVisible` apply when the toast region is first
created and do not react afterwards; every other toast option is read each time a toast opens.

## Server rendering

Defaults live in the injector of each application instance, so concurrent server requests never
share them. Do not keep a module-level `signal` in an application config shared by requests; create
it inside a function default or a service.

## Global control size

`defaults.size` applies to every primitive with a `size` input when the local input and the
component key do not set one. A primitive whose size type is narrower than `KuiSize` ignores
unsupported values; `kui-calendar` supports `sm | md`, so a global `size: 'xs'` leaves it at `md`.
`kui-icon` is excluded because its `size` is a raw CSS size.

Precedence for control size:

```text
local input > defaults.<component>.size > defaults.size > md
```

Field controls (`kuiInput`, `kuiTextarea`, `kuiNumberInput`, `kuiColorInput`, `kuiCheckbox`,
`kuiRadio`, `kuiSwitch`) inherit the size of their parent `kui-field` before the global size.
`kui-field` itself resolves `local size > defaults.field.size > defaults.size > md`. `kuiSelect`,
`kuiCombobox`, `kuiDatePicker` and `kuiTimePicker` have no `size` input and follow the parent field.

## Clearable controls

```text
local clearable > defaults.<select|combobox|datePicker|timePicker> > defaults.field > component default
```

Select defaults to `false`; Combobox, Date Picker and Time Picker default to `true`.

## Tooltip

```text
local triggerType > defaults.tooltip.triggerType > auto
```

`auto` shows tooltips on mouse hover and keyboard focus and toggles them on touch tap. `hover`
disables touch taps. `click` uses click or keyboard activation on every input device. `none`
disables the directive. Tooltip content stays supplemental and non-interactive; use `kuiPopover`
for links, buttons or richer content.

## Button primitives

`kuiButton` and `kuiIconButton` use separate keys because their default shapes differ on purpose
(`solid` for ordinary buttons, `ghost` for icon-only buttons):

```text
local input > defaults.button / defaults.iconButton > defaults.size > component default
```

## Migration from the token-based API

The injection tokens `KUI_BUTTON_OPTIONS`, `KUI_FIELD_OPTIONS`, `KUI_SELECT_OPTIONS`,
`KUI_COMBOBOX_OPTIONS`, `KUI_TOOLTIP_OPTIONS` and `KUI_TOAST_OPTIONS` are removed. The provider
functions remain as deprecated wrappers (removal in 3.0):

| Before                                            | After                                        |
| ------------------------------------------------- | -------------------------------------------- |
| `kuiProvideButtonOptions({ button, iconButton })` | `kuiProvideDefaults({ button, iconButton })` |
| `kuiProvideFieldOptions(options)`                 | `kuiProvideDefaults({ field: options })`     |
| `kuiProvideSelectOptions(options)`                | `kuiProvideDefaults({ select: options })`    |
| `kuiProvideComboboxOptions(options)`              | `kuiProvideDefaults({ combobox: options })`  |
| `kuiProvideTooltipOptions(options)`               | `kuiProvideDefaults({ tooltip: options })`   |
| `provideKuiToastOptions(options)`                 | `kuiProvideDefaults({ toast: options })`     |
| `provideKikitaUi({ tooltip })`                    | `provideKikitaUi({ defaults: { tooltip } })` |
| `KuiButtonOptions { button, iconButton }`         | `KuiButtonProviderOptions` (deprecated)      |
| `KuiButtonPrimitiveOptions`                       | `KuiButtonBaseOptions`                       |
| `KikitaUiDefaults`                                | `KuiComponentDefaults`                       |

`KuiButtonOptions` now describes the options of one button (`shape`, `appearance`, `size`). Two
behaviour changes: a nested level now merges with its parent per property (before, a nested field
provider replaced the whole parent object), and `kuiDatePicker` and `kuiTimePicker` read their own
`datePicker` and `timePicker` keys before the `field` key.

## Adding a new default

Before adding an option to the map:

1. Confirm it is a preference shared by many instances, not data or per-instance state.
2. Add it to the options interface of the primitive, or to a shared base when two or more
   primitives use the same name, meaning and type.
3. Read it in the component inside a `computed`, after the local input and before the built-in
   default, through `inject(KuiDefaults).get('<key>')`.
4. Add a spec for precedence and for a nested level, update the component page, this page and
   `CHANGELOG.md`.

Poor candidates: current value, open or loading state, disabled, readonly or validation state,
density (theme seeds), labels and accessible names, and one-off visual tweaks better expressed as
CSS variables or local inputs.
