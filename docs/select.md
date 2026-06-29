# Select

`input[kuiSelect]` converts a native readonly input into a Kikita select trigger.
It uses `kui-dropdown` and `kuiOption` for the floating listbox, so option markup
stays explicit and composable.

## Import

```ts
import {
  KuiDropdownComponent,
  KuiFieldComponent,
  KuiOptionDirective,
  KuiSelectDirective,
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

## Inputs

| Input         | Type                   | Default | Description                                                                    |
| ------------- | ---------------------- | ------- | ------------------------------------------------------------------------------ |
| `value`       | `T \| null`            | `null`  | Selected value. Bound by `[formField]` or `[(value)]`.                         |
| `disabled`    | `boolean`              | `false` | Disables the native input and prevents opening the dropdown.                   |
| `readonly`    | `boolean`              | `false` | Prevents opening the dropdown while keeping the field visually enabled.        |
| `invalid`     | `boolean`              | `false` | Set by `[formField]`; reflects `aria-invalid`.                                 |
| `errors`      | `ValidationError[]`    | `[]`    | Set by `[formField]`; consumed by `kui-field` for automatic error text.        |
| `touched`     | `boolean`              | `false` | Set by `[formField]`.                                                          |
| `kuiLabelFn`  | `(item: T) => string`  | -       | Maps selected object values to display text.                                   |
| `placeholder` | `string`               | `''`    | Placeholder on the readonly input.                                             |
| `clearable`   | `boolean \| undefined` | -       | Shows a clear button when a value is selected; falls back to provider options. |

## Outputs

| Output  | Description                                                       |
| ------- | ----------------------------------------------------------------- |
| `touch` | Emitted after an opened dropdown closes for Signal Forms support. |

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

`kui-field` handles required markers, hint/error wiring, and automatic error
messages from the projected form field.

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
- Use `kui-field` for label, hint, error, and `aria-describedby` wiring.

## Styling

```css
@import '@kikita-labs/ui/styles';
```

Select consumes `input.css`, `listbox.css`, `dropdown.css`, and field styles
through the public `@kikita-labs/ui/styles` entrypoint.
