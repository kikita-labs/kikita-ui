# Combobox

`input[kuiCombobox]` converts a native text input into a searchable Kikita combobox trigger.

Use Select for fixed choices without typing. Use Combobox when users need to type a query,
filter local options, or load options from an API. Multiple chip-backed selection is intentionally
not part of Combobox; it belongs to a future input-chip or multi-select primitive.

## Import

```ts
import {
  KuiComboboxDirective,
  KuiComboboxHighlightPipe,
  KuiDropdownComponent,
  KuiFieldComponent,
  KuiOptionDirective,
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
  <input
    kuiCombobox
    [(value)]="assignee"
    [(query)]="query"
    [kuiLabelFn]="personLabel"
    placeholder="Search people..."
    (search)="query.set($event)"
  />

  <kui-dropdown>
    @for (person of filteredPeople(); track person.id) {
    <button kuiOption [value]="person">
      <span class="kui-combobox-match-label">
        @for (segment of person.name | kuiComboboxHighlight: query(); track $index) { @if
        (segment.match) {
        <mark class="kui-combobox-highlight">{{ segment.text }}</mark>
        } @else {
        <span>{{ segment.text }}</span>
        } }
      </span>
    </button>
    } @empty {
    <div class="kui-combobox-empty">No people found</div>
    }
  </kui-dropdown>
</kui-field>
```

```ts
assignee = signal<Person | null>(null);
query = signal('');
personLabel = (person: Person) => person.name;
filteredPeople = computed(() => {
  const q = this.query().toLocaleLowerCase();
  return q
    ? this.people.filter((person) => person.name.toLocaleLowerCase().includes(q))
    : this.people;
});
```

Inside `kui-field`, Combobox inherits field id, label association, `aria-describedby`,
invalid state, and field size.

## API Search

Use `(search)` for remote requests. The directive does not own async data; the application updates
the projected dropdown options when results arrive.

```html
<kui-field label="Reviewer">
  <input
    kuiCombobox
    [(value)]="reviewer"
    [(query)]="reviewerQuery"
    [loading]="loading()"
    [kuiLabelFn]="personLabel"
    placeholder="Type to search..."
    (search)="loadReviewers($event)"
  />

  <kui-dropdown>
    @if (loading()) {
    <div class="kui-combobox-loading-row">
      <span class="kui-combobox-loader" aria-hidden="true"></span>
      Loading people
    </div>
    } @else { @for (person of reviewers(); track person.id) {
    <button kuiOption [value]="person">{{ person.name }}</button>
    } @empty {
    <div class="kui-combobox-empty">No matches</div>
    } }
  </kui-dropdown>
</kui-field>
```

```ts
loadReviewers(query: string): void {
  this.loading.set(true);
  this.api.searchPeople(query).subscribe((people) => {
    this.reviewers.set(people);
    this.loading.set(false);
  });
}
```

Use `mode="async"` as documentation of intent when filtering is remote. The mode keeps filtering
outside the directive.

## Free Input

```html
<kui-field label="Tag">
  <input kuiCombobox mode="free" [(value)]="tag" placeholder="Type or choose..." />
  <kui-dropdown>
    <button kuiOption value="Bug">Bug</button>
    <button kuiOption value="Feature">Feature</button>
  </kui-dropdown>
</kui-field>
```

`mode="free"` stores typed text as the control value. In the default `filter` mode, editing text
clears the selected value until the user selects a projected `kuiOption`.

## Inputs And Outputs

| API           | Type                            | Default    | Notes                                                             |
| ------------- | ------------------------------- | ---------- | ----------------------------------------------------------------- |
| `value`       | `T \| string \| null`           | `null`     | Selected value. Bound by `[formField]` or `[(value)]`.            |
| `query`       | `string`                        | `''`       | Current search text.                                              |
| `search`      | `OutputEmitterRef<string>`      | -          | Emits on every native input edit. Use for local or remote search. |
| `kuiLabelFn`  | `(item: T) => string`           | `String()` | Maps selected object values to input text.                        |
| `placeholder` | `string`                        | `''`       | Native input placeholder.                                         |
| `mode`        | `'filter' \| 'free' \| 'async'` | `'filter'` | `free` stores typed text; `async` documents external filtering.   |
| `clearable`   | `boolean \| undefined`          | `true`     | Shows clear affordance. Falls back to combobox/field providers.   |
| `loading`     | `boolean`                       | `false`    | Shows suffix loader; loading row content is projected.            |
| `disabled`    | `boolean`                       | `false`    | Disables the input.                                               |
| `readonly`    | `boolean`                       | `false`    | Keeps value readable but prevents editing.                        |
| `invalid`     | `boolean`                       | `false`    | Applies ARIA invalid state; field also contributes invalid state. |

## Accessibility

- The host remains a native `<input>`.
- The input uses `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`, and `aria-controls`.
- `kui-field` provides label, hint, error, required marker, `aria-describedby`, and inherited invalid state.
- `kui-dropdown` renders the popup listbox through Angular CDK overlay.
- `kuiOption` provides `role="option"`, `aria-selected`, disabled state, click selection, and keyboard navigation.
- Arrow keys open the dropdown and move focus to the first or last enabled option.
- Escape closes the dropdown.

## Provider Defaults

Use `kuiProvideComboboxOptions` for app-wide combobox defaults:

```ts
providers: [
  kuiProvideComboboxOptions({
    clearable: true,
  }),
];
```

```text
clearable: local input > KUI_COMBOBOX_OPTIONS > KUI_FIELD_OPTIONS > true
```

## Tokens

Combobox uses `--kui-combobox-*` variables for suffix affordances, loader, and highlight treatment.
Field geometry, border, radius, focus ring, invalid state, label, hint, and error rendering come from
`kui-field` and `kui-input` tokens.
