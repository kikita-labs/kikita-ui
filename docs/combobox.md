# Combobox

`kui-combobox` is a searchable field for selecting one or more values from a list.

Use Select for simple fixed choices. Use Combobox when users need filtering, async loading, free text, or multiple selected chips.

## Import

```ts
import { KuiComboboxComponent, KuiFieldComponent } from '@kikita-labs/ui';
```

Import runtime styles once:

```ts
import '@kikita-labs/ui/styles';
```

## Basic Usage

```html
<kui-field label="Assignee">
  <kui-combobox
    [options]="people"
    [(value)]="assignee"
    [labelFn]="personLabel"
    placeholder="Search people..."
  />
</kui-field>
```

```ts
assignee = signal<Person | null>(null);
personLabel = (person: Person) => person.name;
```

Inside `kui-field`, Combobox inherits the field id, `aria-describedby`, invalid state, and field size unless those are explicitly overridden.

## Multiple

```html
<kui-field label="Reviewers">
  <kui-combobox
    multiple
    [options]="people"
    [(value)]="reviewers"
    [labelFn]="personLabel"
    placeholder="Search reviewers..."
  />
</kui-field>
```

```ts
reviewers = signal<readonly Person[]>([]);
```

## Inputs

| Input         | Type                                  | Default    | Notes                                                                      |
| ------------- | ------------------------------------- | ---------- | -------------------------------------------------------------------------- |
| `options`     | `readonly T[]`                        | `[]`       | Available options.                                                         |
| `value`       | `T \| readonly T[] \| string \| null` | `null`     | Selected value. Multiple mode uses arrays. Free mode may use string.       |
| `query`       | `string`                              | `''`       | Current filter text.                                                       |
| `labelFn`     | `(item: T) => string`                 | -          | Maps option values to display labels.                                      |
| `placeholder` | `string`                              | `''`       | Input placeholder.                                                         |
| `size`        | `'sm' \| 'md' \| 'lg'`                | `'md'`     | Control size.                                                              |
| `mode`        | `'filter' \| 'free' \| 'async'`       | `'filter'` | `free` stores arbitrary typed text; `async` does not local-filter options. |
| `multiple`    | `boolean`                             | `false`    | Enables chip-backed array values.                                          |
| `clearable`   | `boolean \| undefined`                | `true`     | Shows the clear affordance. Falls back to `KUI_FIELD_OPTIONS.clearable`.   |
| `loading`     | `boolean`                             | `false`    | Shows loading affordance and loading row.                                  |
| `disabled`    | `boolean`                             | `false`    | Disables the control.                                                      |
| `readonly`    | `boolean`                             | `false`    | Keeps value readable but prevents editing.                                 |
| `invalid`     | `boolean`                             | `false`    | Applies invalid visual and ARIA state.                                     |

## Accessibility

- Native input uses `role="combobox"`.
- `kui-field` provides label, hint, error, required, `aria-describedby`, and inherited invalid state wiring.
- Popup list uses `role="listbox"`.
- Options use native buttons with `role="option"` and `aria-selected`.
- Active option is exposed through `aria-activedescendant`.
- Multiple mode marks the list with `aria-multiselectable`.
- Chips use `[kuiChip]` and `button[kuiChipRemove]` internally.

## Behavior Notes

- Selecting a single option closes the list and keeps focus on the input for keyboard continuity.
- Clicking the focused input opens the list again.
- The chevron affordance is a button that toggles the list while keeping DOM focus on the input.
- Editing the text in single filter mode clears the selected value until an option is selected again.
- The clear affordance follows `clearable`, then `KUI_FIELD_OPTIONS.clearable`, then the component default.

## Tokens

Combobox uses `--kui-combobox-*` variables for control dimensions, borders,
suffix space, loading affordance, and z-index. Clear and chevron buttons reuse
the shared `--kui-field-action-*` affordance tokens. Options reuse Kikita
listbox-like semantic color tokens.
