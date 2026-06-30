# Dropdown

`kui-dropdown` is a primitive floating panel rendered through Angular CDK Overlay.
It handles positioning, open/close animation, outside click, scroll-follow, and
Escape close. It does not own selection or value state; Select, Combobox, Menu,
or another host component provides that context.

## Import

```ts
import { KuiDropdownComponent, KuiDropdownForDirective, KuiOptionDirective } from '@kikita-labs/ui';
```

## Usage

### Inside `kui-field`

`kui-field` detects a nested dropdown, sets itself as the anchor, and toggles the
panel when the field is clicked. This is the normal pattern for `input[kuiSelect]`.

```html
<kui-field label="Fruit">
  <input kuiSelect [(value)]="fruit" placeholder="Pick..." />
  <kui-dropdown>
    @for (option of options; track option) {
    <div [kuiOption]="option">{{ option }}</div>
    }
  </kui-dropdown>
</kui-field>
```

### Trigger directive

Use `[kuiDropdownFor]` when the dropdown is anchored to a standalone trigger.
Prefer a native `<button>` so keyboard behavior and button semantics are already
correct.

```html
<button type="button" [kuiDropdownFor]="menu">Actions</button>

<kui-dropdown #menu [maxHeight]="null">
  <div kuiOption="edit">Edit</div>
  <div kuiOption="delete" [disabled]="true">Delete</div>
</kui-dropdown>
```

For non-button triggers, the host element must already be focusable and handle
keyboard activation. The directive only wires click toggling, `aria-expanded`,
and `aria-haspopup`.

## `KuiDropdownComponent` API

| Input       | Type             | Default   | Description                                  |
| ----------- | ---------------- | --------- | -------------------------------------------- |
| `maxHeight` | `string \| null` | `'240px'` | Max height of panel; `null` removes the cap. |
| `offset`    | `number`         | `4`       | Gap between anchor and panel edge in px.     |

| Signal   | Type              | Description         |
| -------- | ----------------- | ------------------- |
| `isOpen` | `Signal<boolean>` | Current open state. |

| Method          | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `open()`        | Show panel and attach scroll/outside-click/Escape listeners. |
| `close()`       | Start close animation and detach listeners.                  |
| `toggle()`      | Open when closed, close when open.                           |
| `setAnchor(el)` | Set anchor imperatively. Called by field and dropdownFor.    |
| `getPanel()`    | Return the rendered panel element, if attached.              |
| `getPanelId()`  | Return the stable panel id for ARIA wiring.                  |

## `KuiOptionDirective` API

| Input       | Type      | Description                         |
| ----------- | --------- | ----------------------------------- |
| `kuiOption` | `unknown` | The value this option represents.   |
| `disabled`  | `boolean` | Disables click and keyboard select. |

| Output            | Description                          |
| ----------------- | ------------------------------------ |
| `kuiOptionSelect` | Emits the option value on selection. |

`kuiOption` renders `role="option"`, roving focus targets, selected/disabled
state classes, and Enter/Space selection. Selection state comes from
`KUI_OPTION_CONTEXT`.

## Accessibility

- Keep dropdown triggers native where possible, especially `<button>`.
- Select-style hosts should expose `role="combobox"`, `aria-expanded`,
  `aria-controls`, and `aria-describedby` through their own directive.
- Options use `role="option"` inside the dropdown `role="listbox"` panel.
- Escape closes the panel. Enter/Space selects an option. Tab closes without
  stealing focus back from the next tabbable element.

## CSS Tokens

| Token                   | Default value                       |
| ----------------------- | ----------------------------------- |
| `--kui-dropdown-bg`     | `var(--kui-color-surface-elevated)` |
| `--kui-dropdown-border` | `var(--kui-color-border)`           |
| `--kui-dropdown-radius` | `var(--kui-radius-md)`              |
| `--kui-dropdown-shadow` | `var(--kui-shadow-lg)`              |

## Internals

- Uses Angular CDK `OverlayRef` and `TemplatePortal`.
- Uses `FlexibleConnectedPositionStrategy` with bottom-first, top fallback, and
  `withPush(false)`.
- Uses `scrollStrategies.noop()` plus a document capture scroll listener that
  reapplies the position strategy. This covers ordinary scroll containers that
  are not registered as `CdkScrollable`.
- Uses a document capture click listener for outside click.
- Detaches the overlay after the `kui-dropdown-out` animation finishes.
