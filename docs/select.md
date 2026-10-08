# Select

`input[kuiSelect]` converts a native readonly input into a Kikita select trigger.
It uses `kui-dropdown` and `kuiOption` for the floating listbox, so option markup
stays explicit and composable.

## Import

```ts
import {
  KuiChip,
  KuiChipRemove,
  KuiDropdown,
  KuiField,
  KuiOption,
  KuiSelect,
  KuiSelectValue,
  provideKuiDefaults,
} from '@kikita-labs/ui';
```

## Basic Usage

```html
<kui-field label="Role">
  <input kuiSelect [(value)]="role" placeholder="Select a role..." />
  <kui-dropdown>
    <div kuiOption value="engineer">Software Engineer</div>
    <div kuiOption value="designer">Designer</div>
  </kui-dropdown>
</kui-field>
```

```ts
role = signal<string | null>(null);
```

## Object Values

Use `kuiLabelFn` when the selected value is an object.

```html
<kui-field label="User">
  <input
    kuiSelect
    [(value)]="user"
    [kuiLabelFn]="userLabel"
    [clearable]="true"
    placeholder="Select a user..."
  />
  <kui-dropdown>
    @for (user of users; track user.id) {
    <div kuiOption [value]="user" [disabled]="!user.active">{{ user.name }}</div>
    }
  </kui-dropdown>
</kui-field>
```

```ts
user = signal<User | null>(null);
userLabel = (user: User) => user.name;
```

## Multiple Values

Set `multiple` when the control value is an array. The dropdown stays open while options toggle.
Selected values render as chips inside the field. Values after `maxVisibleChips` collapse into a `+N` chip.
Use `multipleDisplay="text"` when the selected values should render as plain joined input text.
Use `multipleTextFn` to format that text mode.

```html
<kui-field label="Roles">
  <input
    kuiSelect
    multiple
    [(value)]="roles"
    [kuiLabelFn]="roleLabel"
    [clearable]="true"
    [maxVisibleChips]="3"
    placeholder="Select roles..."
  />
  <kui-dropdown>
    @for (role of roleOptions; track role.value) {
    <div kuiOption [value]="role.value">{{ role.label }}</div>
    }
  </kui-dropdown>
</kui-field>
```

```ts
roles = signal<readonly string[]>([]);
roleLabel = (value: string) => roleOptions.find((role) => role.value === value)?.label ?? value;
```

```html
<input kuiSelect multiple multipleDisplay="text" [multipleTextFn]="formatRoles" [(value)]="roles" />
```

```ts
formatRoles = (roles: readonly Role[]) =>
  roles.map((role) => `prefix - ${role.label} postfix!!!`).join(' CUSTOM_SEPARATOR ');
```

## Custom Selected Value Template

Default multiple mode renders removable `kuiChip` values inside the field. Use
`ng-template[kuiSelectValue]` only when the selected value needs custom markup,
per-item appearance, avatars, or a different remove affordance.

```html
<kui-field label="Roles">
  <input kuiSelect multiple [(value)]="roles" [kuiLabelFn]="roleLabel" />

  <ng-template kuiSelectValue let-item let-label="label" let-remove="remove">
    <span kuiChip [appearance]="roleAppearance(item)" size="sm">
      <span class="kui-chip-label">{{ label }}</span>
      <button kuiChipRemove type="button" [attr.aria-label]="'Remove ' + label" (click)="remove()">
        x
      </button>
    </span>
  </ng-template>

  <kui-dropdown>
    @for (role of roleOptions; track role.value) {
    <div kuiOption [value]="role.value">{{ role.label }}</div>
    }
  </kui-dropdown>
</kui-field>
```

The custom template replaces the default chip for each visible selected item.
If the template should be removable, call the provided `remove` callback from a
native button. Hidden values still collapse into the default `+N` overflow chip.

## Inputs

| Input             | Type                              | Default   | Description                                                                    |
| ----------------- | --------------------------------- | --------- | ------------------------------------------------------------------------------ |
| `value`           | `T \| readonly T[] \| null`       | `null`    | Selected value. In `multiple` mode this is an array.                           |
| `disabled`        | `boolean`                         | `false`   | Disables the native input and prevents opening the dropdown.                   |
| `readonly`        | `boolean`                         | `false`   | Prevents opening the dropdown while keeping the field visually enabled.        |
| `invalid`         | `boolean`                         | `false`   | Set by `[formField]`; reflects `aria-invalid`.                                 |
| `errors`          | `ValidationError[]`               | `[]`      | Set by `[formField]`; consumed by `kui-field` for automatic error text.        |
| `touched`         | `boolean`                         | `false`   | Set by `[formField]`.                                                          |
| `multiple`        | `boolean`                         | `false`   | Enables array values and keeps the dropdown open on option selection.          |
| `maxVisibleChips` | `number \| undefined`             | `3`       | Maximum selected chips shown before collapsed `+N` overflow.                   |
| `multipleDisplay` | `'chips' \| 'text'`               | `'chips'` | Renders multiple selections as field chips or plain joined text.               |
| `multipleTextFn`  | `(items: readonly T[]) => string` | -         | Formats the native input value when `multipleDisplay="text"`.                  |
| `kuiLabelFn`      | `(item: T) => string`             | -         | Maps selected object values to display text.                                   |
| `placeholder`     | `string`                          | `''`      | Placeholder on the readonly input.                                             |
| `clearable`       | `boolean \| undefined`            | -         | Shows a clear button when a value is selected; falls back to provider options. |

## Outputs

| Output  | Description                                                       |
| ------- | ----------------------------------------------------------------- |
| `touch` | Emitted after an opened dropdown closes for Signal Forms support. |

## Provider Defaults

Use `provideKuiDefaults` (or `provideKikitaUi({ defaults })`) for select defaults:

```ts
providers: [provideKuiDefaults({ select: { clearable: true, maxVisibleChips: 2 } })];
```

Local inputs win over select provider defaults. Field defaults are used only for shared clearable
behavior inherited through `KuiFieldControlOptions`:

```text
clearable: local input > defaults.select > defaults.field > false
maxVisibleChips: local input > defaults.select > 3
```

See `docs/di-defaults.md` before adding or changing provider defaults.

### Configurable options

`defaults.select`:

| Option            | Values              | Description                                                                                                                    |
| ----------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `clearable`       | `boolean`           | When true, field controls with clear affordances show a clear button by default.                                               |
| `multipleDisplay` | `'chips' \| 'text'` | How a multiple select shows its selection.                                                                                     |
| `maxVisibleChips` | `number`            | Default visible selected chips before select renders a collapsed `+N` chip.                                                    |
| `chevronIcon`     | `KuiIconGlyph`      | Icon of the options toggle. Takes precedence over `defaults.icons.pickerChevron`. See [Structural Icons](structural-icons.md). |
| `clearIcon`       | `KuiIconGlyph`      | Icon of the clear button. Takes precedence over `defaults.icons.clear`. See [Structural Icons](structural-icons.md).           |

## Signal Forms

Put `[formField]` on the native input inside `kui-field`.

```html
<kui-field label="Role">
  <input kuiSelect [formField]="form.role" placeholder="Select a role..." />
  <kui-dropdown>
    <div kuiOption value="engineer">Software Engineer</div>
  </kui-dropdown>
</kui-field>
```

`kui-field` handles required markers, explicit field errors, hint/error wiring,
and automatic error messages from the projected form field.

## Keyboard Navigation

| Key               | Action                                      |
| ----------------- | ------------------------------------------- |
| `Enter` / `Space` | Open dropdown, then select focused option.  |
| `ArrowDown`       | Open dropdown and focus first option.       |
| `ArrowUp`         | Open dropdown and focus last option.        |
| `Escape`          | Close dropdown.                             |
| `Tab`             | Close dropdown through focused option flow. |

## Accessibility

- The input uses `role="combobox"`, `aria-haspopup="listbox"`, and `aria-expanded`.
- The dropdown panel uses `role="listbox"`.
- Each `kuiOption` uses `role="option"`, `aria-selected`, and `aria-disabled`.
- The clear button is a native button with `aria-label="Clear"`.
- Multiple selected values render removable chip buttons inside the field.
- Custom selected value templates receive `item`, `label`, and `remove` context values.
- `maxVisibleChips` is count-based. It does not currently auto-measure field width.
- Use `kui-field` for label, hint, error, `aria-describedby`, and `aria-invalid` wiring.

## Styling

```css
@import '@kikita-labs/ui/styles';
```

Select consumes `input.css`, `field-actions.css`, `listbox.css`, and `dropdown.css`
through the public `@kikita-labs/ui/styles` entrypoint. The clear affordance uses
the shared `--kui-field-action-*` tokens and select-specific suffix/chip-layer tokens.

## Migration Notes

The legacy Select chrome tokens (`--kui-select-bg`, `--kui-select-border`,
`--kui-select-border-hover`, `--kui-select-border-focus`, `--kui-select-border-error` and
`--kui-select-radius`) were removed in 2.0. `input[kuiSelect]` uses the shared input tokens: see
[tokens.md](tokens.md#removed-in-20) for the replacements.

<!-- color-tokens:begin -->

## Color Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the semantic role in the Default column.

| Token                                    | Default                             | Controls                                  |
| ---------------------------------------- | ----------------------------------- | ----------------------------------------- |
| `--kui-listbox-option-color`             | `--kui-color-text`                  | Listbox option color                      |
| `--kui-listbox-option-focus-ring-color`  | `--kui-color-focus`                 | Listbox option focus ring color           |
| `--kui-listbox-option-bg-selected`       | `--kui-color-primary-soft-bg`       | Listbox option background, selected       |
| `--kui-listbox-option-color-selected`    | `--kui-color-primary-soft-text`     | Listbox option color, selected            |
| `--kui-listbox-option-bg-selected-hover` | `--kui-color-primary-soft-bg-hover` | Listbox option background, selected hover |
| `--kui-listbox-group-label-color`        | `--kui-color-text-secondary`        | Listbox group label color                 |
| `--kui-listbox-separator-bg`             | `--kui-color-border`                | Listbox separator background              |
| `--kui-listbox-empty-color`              | `--kui-color-text-secondary`        | Listbox empty color                       |
| `--kui-select-chevron-color-expanded`    | `--kui-color-primary-text`          | Select chevron color, expanded            |

<!-- color-tokens:end -->

<!-- geometry-tokens:begin -->

## Geometry Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the scale token in the Default column.

| Token                                           | Default              | Controls                                                       |
| ----------------------------------------------- | -------------------- | -------------------------------------------------------------- |
| `--kui-listbox-option-gap`                      | `--kui-space-2`      | Option gap                                                     |
| `--kui-listbox-option-padding-block`            | `--kui-space-2`      | Option padding, block                                          |
| `--kui-listbox-option-padding-inline`           | `--kui-space-3`      | Option padding, inline                                         |
| `--kui-listbox-option-radius`                   | `--kui-radius-sm`    | Option corner radius                                           |
| `--kui-listbox-option-font-size`                | `--kui-text-sm-size` | Option font size                                               |
| `--kui-listbox-group-label-font-size`           | `--kui-text-xs-size` | Group label font size                                          |
| `--kui-listbox-group-label-padding-block-start` | `--kui-space-2`      | Group label padding, block start                               |
| `--kui-listbox-group-label-padding-inline`      | `--kui-space-3`      | Group label padding, inline                                    |
| `--kui-listbox-group-label-padding-block-end`   | `--kui-space-1`      | Group label padding, block end                                 |
| `--kui-listbox-empty-padding-block`             | `--kui-space-4`      | Empty padding, block                                           |
| `--kui-listbox-empty-padding-inline`            | `--kui-space-3`      | Empty padding, inline                                          |
| `--kui-listbox-empty-font-size`                 | `--kui-text-sm-size` | Empty font size                                                |
| `--kui-select-padding-inline-end`               | `34px`               | Input end padding that clears the chevron                      |
| `--kui-select-padding-inline-end-clearable`     | `56px`               | Input end padding that clears the clear button and the chevron |
| `--kui-field-clear-icon-size`                   | `12px`               | Clear button icon size (Select, Combobox, Date Picker)         |

<!-- geometry-tokens:end -->
