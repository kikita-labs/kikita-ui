# Select

`input[kuiSelect]` converts a native readonly input into a Kikita select trigger.
It uses `kui-dropdown` and `kuiOption` for the floating listbox, so option markup
stays explicit and composable.

## Import

```ts
import {
  KuiChipDirective,
  KuiChipRemoveDirective,
  KuiDropdownComponent,
  KuiFieldComponent,
  KuiOptionDirective,
  KuiSelectDirective,
  KuiSelectValueDirective,
  kuiProvideSelectOptions,
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

Use `kuiProvideSelectOptions` for app-wide select defaults:

```ts
providers: [kuiProvideSelectOptions({ clearable: true, maxVisibleChips: 2 })];
```

Local inputs win over select provider defaults. Field defaults are used only for shared clearable
behavior:

```text
clearable: local input > KUI_SELECT_OPTIONS > KUI_FIELD_OPTIONS > false
maxVisibleChips: local input > KUI_SELECT_OPTIONS > 3
```

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
