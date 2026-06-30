# Menu

`kui-menu` is an overlay action menu. Use it for commands such as edit, copy,
archive, delete, or row actions. Do not use it as a value picker; use Select or
Dropdown/Listbox for selection.

## Import

```ts
import {
  KuiMenuComponent,
  KuiMenuForDirective,
  KuiMenuHeaderDirective,
  KuiMenuItemDirective,
  KuiSeparatorDirective,
} from '@kikita-labs/ui';
```

Import styles once:

```css
@import '@kikita-labs/ui/styles/kikita-ui.css';
```

## Basic Usage

```html
<button kuiButton type="button" [kuiMenuFor]="actionsMenu">Actions</button>

<kui-menu #actionsMenu ariaLabel="Project actions">
  <button type="button" kuiMenuItem>
    <span class="kui-menu-item__label">Edit</span>
  </button>
  <button type="button" kuiMenuItem>
    <span class="kui-menu-item__label">Copy</span>
  </button>
  <hr kuiSeparator spacing="xs" />
  <button type="button" kuiMenuItem appearance="destructive">
    <span class="kui-menu-item__label">Delete</span>
  </button>
</kui-menu>
```

## Icons And Shortcuts

Icons and shortcut hints are optional projected content. Shortcuts are visual
hints only; they do not bind global keyboard commands.

```html
<button type="button" kuiMenuItem>
  <span class="kui-menu-item__icon" aria-hidden="true">E</span>
  <span class="kui-menu-item__label">Rename</span>
  <span class="kui-menu-item__shortcut">F2</span>
</button>
```

## Group Header

```html
<div kuiMenuHeader>Project</div>
<button type="button" kuiMenuItem>
  <span class="kui-menu-item__label">Archive</span>
</button>
```

## API

### `kui-menu`

| Input       | Type               | Default     | Description                                   |
| ----------- | ------------------ | ----------- | --------------------------------------------- |
| `ariaLabel` | `string`           | `'Actions'` | Accessible name for the menu panel.           |
| `menuAlign` | `'start' \| 'end'` | `'start'`   | Horizontal alignment relative to the trigger. |
| `offset`    | `number`           | `4`         | Pixel gap between trigger and menu panel.     |
| `minWidth`  | `string \| null`   | `null`      | Optional overlay minimum width.               |

### `[kuiMenuFor]`

Wires a native element as the trigger. The directive sets:

- `aria-haspopup="menu"`
- `aria-expanded`
- `aria-controls` only while the overlay panel exists

### `button[kuiMenuItem]`, `a[kuiMenuItem]`

| Input        | Type                         | Default     | Description                                                       |
| ------------ | ---------------------------- | ----------- | ----------------------------------------------------------------- |
| `appearance` | `'neutral' \| 'destructive'` | `'neutral'` | Visual item appearance.                                           |
| `disabled`   | `boolean`                    | `false`     | Applies disabled/ARIA-disabled semantics and prevents activation. |

## Accessibility

- The panel uses `role="menu"`.
- Items use `role="menuitem"`.
- Separators use native `hr[kuiSeparator]`.
- Group headers use `role="presentation"`.
- Disabled items expose `aria-disabled="true"`.
- `ArrowDown` / `ArrowUp` opens from the trigger and focuses first/last item.
- Inside the menu, `ArrowDown`, `ArrowUp`, `Home`, and `End` move focus.
- `Escape` closes the menu and returns focus to the trigger.
- `Tab` closes the menu and lets focus continue normally.

## Deferred

Per the Claude Design brief, these are not part of the first Menu primitive:

- nested submenus
- checkbox/radio menu items
- right-click context menu helper
