# Dropdown

Primitive floating panel. Handles positioning (`position: fixed`, scroll-follow), open/close animation, click-outside, and Escape key. Does not know about values or selection — those belong to Select, Combobox, Menu, etc.

---

## Components & Directives

| Symbol                    | Selector           | Role                                                    |
| ------------------------- | ------------------ | ------------------------------------------------------- |
| `KuiDropdownComponent`    | `kui-dropdown`     | Floating panel                                          |
| `KuiDropdownForDirective` | `[kuiDropdownFor]` | Wires any element as a trigger                          |
| `KuiOptionDirective`      | `[kuiOption]`      | Styled option row; closes dropdown on click             |
| `KUI_OPTION_CONTEXT`      | —                  | DI token for Select/Combobox to control selection state |

---

## Usage

### Mode 1 — inside `kui-field` (auto, no state management)

Field detects a nested `kui-dropdown` via `contentChild`, sets itself as anchor, and toggles open/close on click.

```html
<kui-field label="Fruit">
  <input kuiInput [value]="selected() ?? ''" placeholder="Pick…" readonly />
  <kui-dropdown>
    @for (opt of options; track opt) {
    <div [kuiOption]="opt" (kuiOptionSelect)="selected.set($any($event))">{{ opt }}</div>
    }
  </kui-dropdown>
</kui-field>
```

### Mode 2 — `[kuiDropdownFor]` trigger

Attach to any element. The directive wires click → `toggle()` and sets `aria-expanded`.

```html
<button [kuiDropdownFor]="menu">Actions</button>
<kui-dropdown #menu [maxHeight]="null">
  <div kuiOption="edit">Edit</div>
  <div kuiOption="delete" [disabled]="true">Delete</div>
</kui-dropdown>
```

### Mode 3 — manual (explicit anchor + imperative open/close)

```html
<button #triggerEl (click)="dropdown.toggle()">Open</button>
<kui-dropdown #dropdown [anchor]="triggerEl"> ... </kui-dropdown>
```

---

## `KuiDropdownComponent` API

| Input       | Type                                | Default   | Description                                           |
| ----------- | ----------------------------------- | --------- | ----------------------------------------------------- |
| `anchor`    | `HTMLElement \| ElementRef \| null` | `null`    | Explicit anchor element (overridden by `setAnchor()`) |
| `maxHeight` | `string \| null`                    | `'240px'` | Max height of panel; `null` = no cap                  |
| `offset`    | `number`                            | `4`       | Gap between anchor bottom and panel top (px)          |

| Signal   | Type              | Description                                 |
| -------- | ----------------- | ------------------------------------------- |
| `isOpen` | `Signal<boolean>` | Current open state (public readable signal) |

| Method          | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `open()`        | Show panel, attach scroll/click-outside/Escape listeners     |
| `close()`       | Start close animation; detach listeners                      |
| `toggle()`      | `open()` if closed, `close()` if open                        |
| `setAnchor(el)` | Set anchor imperatively (called by field and kuiDropdownFor) |

---

## `KuiOptionDirective` API

| Input       | Type      | Description                      |
| ----------- | --------- | -------------------------------- |
| `kuiOption` | `unknown` | The value this option represents |
| `disabled`  | `boolean` | Disables click and dims the row  |

| Output            | Description                          |
| ----------------- | ------------------------------------ |
| `kuiOptionSelect` | Emits the `kuiOption` value on click |

Applied CSS classes: `.kui-listbox-option`, `.kui-listbox-option--selected` (via `KUI_OPTION_CONTEXT`), `.kui-listbox-option--disabled`.

---

## CSS Tokens

Scoped to `.kui-dropdown` (component-local defaults):

| Token                   | Default value                       |
| ----------------------- | ----------------------------------- |
| `--kui-dropdown-bg`     | `var(--kui-color-surface-elevated)` |
| `--kui-dropdown-border` | `var(--kui-color-border)`           |
| `--kui-dropdown-radius` | `var(--kui-radius-md)`              |
| `--kui-dropdown-shadow` | `var(--kui-shadow-lg)`              |

---

## Internals

- **Angular CDK Overlay** — panel rendered via `OverlayRef` + `TemplatePortal` inside `.cdk-overlay-container` in body. Escapes any `overflow:hidden` or CSS `transform` ancestor.
- **Position strategy** — `FlexibleConnectedPositionStrategy`: prefers below anchor, flips above when not enough space. `withPush(false)` — no viewport nudge. `data-placement` attribute (`top`/`bottom`) set via `positionChanges` for CSS animation direction.
- **Scroll repositioning** — `scrollStrategies.reposition()` repositions panel on scroll without closing it.
- **Close animation** — `isClosing` signal applies `.kui-dropdown--closing` class → 120ms `kui-dropdown-out` keyframe → `animationend` → `overlayRef.detach()`. Panel stays in DOM during animation.
- **Click-outside** — `document.addEventListener('click', handler, { capture: true })` fires before any element handler, including CDK top-layer popover. Checks `!overlayEl.contains(e.target)`.
- **Escape** — `overlayRef.keydownEvents()` observable.

---

## Integration with Select / Combobox

Provide `KUI_OPTION_CONTEXT` from the parent component to give options knowledge of the selected value:

```typescript
providers: [{
  provide: KUI_OPTION_CONTEXT,
  useFactory: () => {
    const host = inject(MySelectComponent);
    return {
      isSelected: (v) => computed(() => host.value() === v),
      select: (v) => host.value.set(v as string),
    } satisfies KuiOptionContext;
  },
}],
```

---
