# Combobox

`kui-combobox` is a searchable field for selecting one or more values from a list.

Use Select for simple fixed choices. Use Combobox when users need filtering, async loading, free text, or multiple selected chips.

## Import

```ts
import {
  KuiChipDirective,
  KuiChipRemoveDirective,
  KuiComboboxComponent,
  KuiComboboxValueDirective,
  KuiFieldComponent,
  kuiProvideComboboxOptions,
} from '@kikita-labs/ui';
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
    [maxVisibleChips]="3"
    placeholder="Search reviewers..."
  />
</kui-field>
```

```ts
reviewers = signal<readonly Person[]>([]);
```

Values after `maxVisibleChips` collapse into a `+N` chip inside the field.
When the field becomes too narrow, Combobox reduces the visible chip count further
and moves the rest into `+N` instead of shrinking chip labels away.
Set `wrapChips` only when the combobox should grow vertically instead of using the collapsed overflow chip.

## Custom Selected Value Template

Default multiple mode renders removable `kuiChip` values inside the field. Use
`ng-template[kuiComboboxValue]` only when the selected value needs custom markup,
per-item appearance, avatars, or a different remove affordance.

```html
<kui-field label="Reviewers">
  <kui-combobox
    multiple
    [options]="people"
    [(value)]="reviewers"
    [labelFn]="personLabel"
    [maxVisibleChips]="3"
  />

  <ng-template kuiComboboxValue let-person let-label="label" let-remove="remove">
    <span kuiChip [appearance]="person.active ? 'success' : 'neutral'" size="sm">
      <span class="kui-chip-label">{{ label }}</span>
      <button kuiChipRemove type="button" [attr.aria-label]="'Remove ' + label" (click)="remove()">
        x
      </button>
    </span>
  </ng-template>
</kui-field>
```

The custom template replaces the default chip for each visible selected item.
If the template should be removable, call the provided `remove` callback from a
native button. Hidden values still collapse into the default `+N` overflow chip.

## Inputs

| Input             | Type                                  | Default      | Notes                                                                       |
| ----------------- | ------------------------------------- | ------------ | --------------------------------------------------------------------------- |
| `options`         | `readonly T[]`                        | `[]`         | Available options.                                                          |
| `value`           | `T \| readonly T[] \| string \| null` | `null`       | Selected value. Multiple mode uses arrays. Free mode may use string.        |
| `query`           | `string`                              | `''`         | Current filter text.                                                        |
| `labelFn`         | `(item: T) => string`                 | -            | Maps option values to display labels.                                       |
| `placeholder`     | `string`                              | `''`         | Input placeholder.                                                          |
| `size`            | `'sm' \| 'md' \| 'lg'`                | `'md'`       | Control size.                                                               |
| `mode`            | `'filter' \| 'free' \| 'async'`       | `'filter'`   | `free` stores arbitrary typed text; `async` does not local-filter options.  |
| `multiple`        | `boolean`                             | `false`      | Enables chip-backed array values.                                           |
| `maxVisibleChips` | `number \| undefined`                 | `3`          | Maximum selected chips before collapsed `+N`; narrow fields may show fewer. |
| `wrapChips`       | `boolean \| undefined`                | `false`      | Allows selected chips to wrap and disables collapsed `+N` overflow.         |
| `clearable`       | `boolean \| undefined`                | `true`       | Shows the clear affordance. Falls back to `KUI_FIELD_OPTIONS.clearable`.    |
| `loading`         | `boolean`                             | `false`      | Shows loading affordance and loading row.                                   |
| `loadingText`     | `string \| undefined`                 | `Loading...` | Text rendered in the loading row.                                           |
| `emptyText`       | `string \| undefined`                 | `No results` | Text rendered when the option list is empty.                                |
| `disabled`        | `boolean`                             | `false`      | Disables the control.                                                       |
| `readonly`        | `boolean`                             | `false`      | Keeps value readable but prevents editing.                                  |
| `invalid`         | `boolean`                             | `false`      | Applies invalid visual and ARIA state.                                      |

## Accessibility

- Native input uses `role="combobox"`.
- `kui-field` provides label, hint, error, required, `aria-describedby`, and inherited invalid state wiring.
- Popup list uses `role="listbox"`.
- Options use native buttons with `role="option"` and `aria-selected`.
- Active option is exposed through `aria-activedescendant`.
- Multiple mode marks the list with `aria-multiselectable`.
- Chips use `[kuiChip]` and `button[kuiChipRemove]` internally.
- Custom selected value templates receive `item`, `label`, and `remove` context values.

## Behavior Notes

- Selecting a single option closes the list and keeps focus on the input for keyboard continuity.
- Clicking the focused input opens the list again.
- The chevron affordance is a button that toggles the list while keeping DOM focus on the input.
- The option list is rendered in an Angular CDK overlay aligned to the combobox control.
- Editing the text in single filter mode clears the selected value until an option is selected again.
- `wrapChips` is opt-in. Default multiple combobox controls stay one-line and use `+N`.
- `maxVisibleChips` is an upper bound. Combobox auto-reduces visible chips at narrow widths.

## Provider Defaults

Use `kuiProvideComboboxOptions` for app-wide combobox defaults:

```ts
providers: [
  kuiProvideComboboxOptions({
    clearable: true,
    maxVisibleChips: 2,
    emptyText: 'No matches',
    loadingText: 'Loading choices',
  }),
];
```

Combobox does not inherit `KUI_SELECT_OPTIONS`. It has its own options token because it has editable
query, loading, empty, async, and free-text behavior.

```text
clearable: local input > KUI_COMBOBOX_OPTIONS > KUI_FIELD_OPTIONS > true
maxVisibleChips: local input > KUI_COMBOBOX_OPTIONS > 3
emptyText: local input > KUI_COMBOBOX_OPTIONS > "No results"
loadingText: local input > KUI_COMBOBOX_OPTIONS > "Loading..."
```

## Tokens

Combobox uses `--kui-combobox-*` variables for control dimensions, borders,
suffix space, loading affordance, and z-index. Clear and chevron buttons reuse
the shared `--kui-field-action-*` affordance tokens. Options reuse Kikita
listbox-like semantic color tokens.
