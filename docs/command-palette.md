# Command Palette

`kui-command-palette` renders a keyboard-first command dialog with grouped, searchable actions.

## Import

```ts
import { KuiCommandPaletteComponent, KuiCommandGroup } from '@kikita-labs/ui';
```

## Usage

```html
<button kuiButton type="button" (click)="open.set(true)">Open command palette</button>

<kui-command-palette
  [(open)]="open"
  [groups]="groups"
  [(query)]="query"
  (selected)="runCommand($event)"
/>
```

```ts
readonly open = signal(false);
readonly query = signal('');

readonly groups: readonly KuiCommandGroup[] = [
  {
    heading: 'Navigation',
    items: [
      {
        id: 'projects',
        label: 'Open projects',
        shortcut: ['G', 'P'],
        keywords: ['workspace'],
      },
    ],
  },
];
```

## Inputs and Outputs

- `open`: two-way model controlling overlay visibility.
- `groups`: command groups rendered in the list.
- `loading`: renders skeleton rows and sets `aria-busy`.
- `placeholder`: search input placeholder.
- `label`: accessible dialog and search input label.
- `emptyText`: empty-state title when no command matches.
- `query`: two-way model for the current search value.
- `selected`: emits the selected `KuiCommandItem`.

## Item Data

`KuiCommandItem` supports `id`, `label`, `description`, `meta`, `badge`, `shortcut`, `icon`,
`danger`, `disabled`, and `keywords`.

Search checks `label`, `description`, `meta`, and `keywords`. Matching text inside item labels is
highlighted.

## Command Identity

Supply a stable, non-empty `id` without whitespace, unique across every group in
one palette, including disabled and filtered-out commands. Use domain keys such
as `file.open` and `project.open`; both may have the visible label "Open". Keep
keys unchanged when translating labels or recreating item objects. Do not derive
keys from labels, array positions, or per-render random values.

Development builds report invalid or duplicate IDs. Production does not repair
invalid data or generate replacement keys; consumers own uniqueness. Separate
palette instances namespace option DOM IDs. `selected` emits the original complete
item, not an ID string. Use `item.id` to dispatch the application action.

Changing groups or query resets keyboard activity to the first enabled match;
an empty result clears the active descendant. Reordering does not preserve the
previous active command. DOM lookup uses `getElementById`, not a CSS selector
built from the consumer key.

This retains the required-ID API and follows
[Angular's tracking guidance](https://angular.dev/guide/templates/control-flow#why-is-track-in-for-blocks-important).
Index tracking remains appropriate for genuinely static lists.

## Accessibility

- Uses a CDK overlay with scroll blocking.
- Uses a modal dialog container with CDK focus trap.
- The search input exposes combobox/listbox relationships through `aria-controls` and
  `aria-activedescendant`.
- Arrow keys move the active option, Enter selects it, Escape closes the palette.
- Disabled commands are skipped by keyboard navigation and cannot be selected.

## Styling

Import `@kikita-labs/ui/styles` once in the app. Command Palette styles are included through the
public style entrypoint and consume `--kui-command-*` tokens.
