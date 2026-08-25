# Dropdown

`kui-dropdown` is a primitive floating panel rendered through Angular CDK Overlay.
It handles positioning, open/close animation, outside click, scroll-follow, and
Escape close. It does not own selection or value state; Select, Combobox, Menu,
or another host component provides that context.

By default, an outside pointer or focus interaction closes the panel. The
anchored trigger is excluded from that outside interaction, while sibling
controls are intentionally treated as outside. `kuiOption` Enter/Space
selection follows the same `closeOnSelect` rule as pointer selection.

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

### Controlled open state

Use the `open` model when the parent owns when the panel should be visible. The
dropdown updates the bound signal when it closes itself because of Escape, an
outside click, or an off-screen anchor.

```ts
readonly resultsOpen = signal(false);
```

```html
<kui-dropdown [(open)]="resultsOpen" panelWidth="anchor" [panelRole]="null">
  <!-- Projected search results. -->
</kui-dropdown>
```

The existing `open()`, `close()`, and `toggle()` methods remain available for
imperative integrations.

## `KuiDropdownComponent` API

| Input           | Type                                      | Default     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------- | ----------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maxHeight`     | `string \| null`                          | `'240px'`   | Preferred max height of panel. Always additionally clamped to the viewport (see below); `null` only removes the _preferred_ cap, not the viewport clamp.                                                                                                                                                                                                                                                                                    |
| `offset`        | `number`                                  | `4`         | Gap between anchor and panel edge in px.                                                                                                                                                                                                                                                                                                                                                                                                    |
| `closeOnSelect` | `boolean`                                 | `true`      | Closes the panel after an enabled option is selected with a pointer or Enter/Space.                                                                                                                                                                                                                                                                                                                                                         |
| `panelRole`     | `'listbox' \| 'dialog' \| 'grid' \| null` | `'listbox'` | ARIA role on the panel. Set to `'dialog'` for non-listbox content, e.g. `kui-calendar`.                                                                                                                                                                                                                                                                                                                                                     |
| `panelWidth`    | `'anchor' \| 'content' \| 'auto'`         | `'anchor'`  | `'anchor'` matches the trigger's width exactly (listboxes). `'content'` grows with the panel's own content but never _below_ the trigger's width, so it isn't clipped by a narrower trigger, e.g. `kui-calendar` in a date picker. `'auto'` ignores the trigger's width entirely and sizes purely to content, for panels that are their own small fixed-size widget regardless of how wide the trigger is, e.g. `kui-color-input`'s picker. |
| `width`         | `string \| null`                          | `null`      | Explicit panel width (any CSS width, e.g. `'320px'`). Overrides `panelWidth` entirely for a panel that's deliberately wider or narrower than its trigger, with no per-component workaround needed.                                                                                                                                                                                                                                          |

### Viewport-Safe By Default

The panel's actual `max-height` is always `min(maxHeight, calc(100vh - var(--kui-dropdown-viewport-margin, 32px)))`; it can never render taller than the viewport with no way to reach the overflow. When content exceeds the available height, the panel scrolls internally instead of clipping or "shrinking" visually. This applies to every `kui-dropdown` consumer with no per-instance opt-in required.

The panel also closes itself if the anchor (trigger) scrolls out of the viewport, instead of following it off-screen or rendering detached from its trigger.

| Signal   | Type                   | Description                                                          |
| -------- | ---------------------- | -------------------------------------------------------------------- |
| `open`   | `ModelSignal<boolean>` | Controlled requested open state. Use `[(open)]` for two-way binding. |
| `isOpen` | `Signal<boolean>`      | Current open state.                                                  |

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
the owning Select, Combobox, Menu, or Field integration. That coordination token
is internal and is not part of the public dropdown API.

## Accessibility

- Keep dropdown triggers native where possible, especially `<button>`.
- Select-style hosts should expose `role="combobox"`, `aria-expanded`,
  `aria-controls`, and `aria-describedby` through their own directive.
- Options use `role="option"` inside the dropdown `role="listbox"` panel.
- Escape closes the panel. Enter/Space selects an option and, by default, closes
  it. Tab closes without stealing focus back from the next tabbable element.

## CSS Tokens

| Token                            | Default value                       |
| -------------------------------- | ----------------------------------- |
| `--kui-dropdown-bg`              | `var(--kui-color-surface-elevated)` |
| `--kui-dropdown-border`          | `var(--kui-color-border)`           |
| `--kui-dropdown-radius`          | `var(--kui-radius-md)`              |
| `--kui-dropdown-shadow`          | `var(--kui-shadow-lg)`              |
| `--kui-dropdown-viewport-margin` | `var(--kui-space-6, 32px)`          |

## Internals

- Uses Angular CDK `OverlayRef` and `TemplatePortal`.
- Uses `FlexibleConnectedPositionStrategy` with bottom-first, top fallback, and
  `withPush(false)`.
- Uses `scrollStrategies.noop()` plus a document capture scroll listener that
  reapplies the position strategy. This covers ordinary scroll containers that
  are not registered as `CdkScrollable`. Scroll events originating from inside
  the panel itself (e.g. scrolling a tall calendar/listbox) are ignored;
  repositioning mid-scroll of the panel's own content raced with the browser's
  scroll commit and reset `scrollTop` back to 0.
- If the scroll listener finds the anchor has scrolled fully out of the
  viewport, it closes the panel instead of repositioning; a detached floating
  panel with no visible trigger is confusing and easy to lose track of.
- Uses a document capture click listener for outside click.
- Detaches the overlay after the `kui-dropdown-out` animation finishes.
