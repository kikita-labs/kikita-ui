# Command Palette

`kui-command-palette` renders a keyboard-first command dialog with grouped, searchable actions.

## Import

```ts
import { KuiCommandPalette, KuiCommandGroup } from '@kikita-labs/ui';
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
- Focus moves to the search input after the overlay has rendered, on every open, including when another control had focus.
- The search input exposes combobox/listbox relationships through `aria-controls` and
  `aria-activedescendant`.
- Arrow keys move the active option, Enter selects it, Escape closes the palette.
- Disabled commands are skipped by keyboard navigation and cannot be selected.

## Styling

Import `@kikita-labs/ui/styles` once in the app. Command Palette styles are included through the
public style entrypoint and consume `--kui-command-*` tokens.

<!-- color-tokens:begin -->

## Color Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the semantic role in the Default column.

| Token                                   | Default                         | Controls                 |
| --------------------------------------- | ------------------------------- | ------------------------ |
| `--kui-command-input-placeholder-color` | `--kui-color-text-placeholder`  | Input placeholder color  |
| `--kui-command-item-indicator-color`    | `--kui-color-primary-indicator` | Item indicator color     |
| `--kui-command-item-label-color-active` | `--kui-color-primary-soft-text` | Item label color, active |
| `--kui-command-item-color-disabled`     | `--kui-color-text-disabled`     | Item color, disabled     |
| `--kui-command-item-bg-danger`          | `--kui-color-danger-soft-bg`    | Item background, danger  |
| `--kui-command-item-match-color`        | `--kui-color-primary-soft-text` | Item match color         |
| `--kui-command-badge-bg`                | `--kui-color-primary-soft-bg`   | Badge background         |
| `--kui-command-badge-color`             | `--kui-color-primary-soft-text` | Badge color              |

<!-- color-tokens:end -->

<!-- geometry-tokens:begin -->

## Geometry Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the scale token in the Default column.

| Token                                             | Default                | Controls                           |
| ------------------------------------------------- | ---------------------- | ---------------------------------- |
| `--kui-command-backdrop-padding-inline`           | `--kui-space-4`        | Backdrop padding, inline           |
| `--kui-command-search-padding-inline`             | `--kui-space-4`        | Search padding, inline             |
| `--kui-command-input-font-size`                   | `--kui-text-base-size` | Input font size                    |
| `--kui-command-list-padding`                      | `--kui-space-1`        | List padding                       |
| `--kui-command-group-heading-padding-block-start` | `--kui-space-3`        | Group heading padding, block start |
| `--kui-command-group-heading-padding-inline`      | `--kui-space-3`        | Group heading padding, inline      |
| `--kui-command-group-heading-padding-block-end`   | `--kui-space-1`        | Group heading padding, block end   |
| `--kui-command-group-heading-font-size`           | `--kui-text-xs-size`   | Group heading font size            |
| `--kui-command-item-padding-inline`               | `--kui-space-3`        | Item padding, inline               |
| `--kui-command-item-radius`                       | `--kui-radius-sm`      | Item corner radius                 |
| `--kui-command-item-label-font-size`              | `--kui-text-sm-size`   | Item label font size               |
| `--kui-command-item-desc-font-size`               | `--kui-text-xs-size`   | Item desc font size                |
| `--kui-command-footer-gap`                        | `--kui-space-3`        | Footer gap                         |
| `--kui-command-footer-padding-block`              | `--kui-space-2`        | Footer padding, block              |
| `--kui-command-footer-padding-inline`             | `--kui-space-4`        | Footer padding, inline             |
| `--kui-command-footer-font-size`                  | `--kui-text-xs-size`   | Footer font size                   |
| `--kui-command-footer-hint-gap`                   | `--kui-space-1`        | Footer hint gap                    |
| `--kui-command-kbd-radius`                        | `--kui-radius-xs`      | Kbd corner radius                  |
| `--kui-command-kbd-font-size`                     | `--kui-text-2xs-size`  | Kbd font size                      |
| `--kui-command-badge-radius`                      | `--kui-radius-full`    | Badge corner radius                |
| `--kui-command-badge-font-size`                   | `--kui-text-2xs-size`  | Badge font size                    |
| `--kui-command-backdrop-padding-block-start`      | `--kui-space-6`        | Backdrop padding, block start      |

<!-- geometry-tokens:end -->
