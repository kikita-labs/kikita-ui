# Dropdown

> **Status: planned.** Design spec pending. Select is temporarily self-contained and will be refactored to use this primitive once Dropdown is shipped.

## Concept

`Dropdown` is a positioning primitive — it anchors a floating panel to a trigger element and handles:

- Fixed-position overlay (renders above page content)
- Scroll tracking (panel follows trigger on scroll)
- Viewport-aware placement (flips when near edge)
- Click-outside and Escape to close
- Accessible ARIA (`aria-expanded`, `aria-haspopup`, focus trap optional)

It has zero opinion about what's inside the panel. Select, Combobox, Menu, DatePicker, and custom panels all use the same primitive.

## Architecture

```
[kuiDropdown]          ← positioning engine + portal logic
[kuiFieldDropdown]     ← wires dropdown to kui-field (chevron, active border, trigger click)
```

### `[kuiDropdown]`

Directive placed on a trigger element. Accepts a `TemplateRef` for panel content.

```ts
@Directive({ selector: '[kuiDropdown]' })
export class KuiDropdownDirective {
  kuiDropdown    = input<TemplateRef<unknown> | null>(null);   // panel content
  placement      = input<KuiPlacement>('bottom-start');        // bottom-start | bottom-end | top-start | top-end
  offset         = input(4);                                   // px gap between trigger and panel
  disabled       = input(false);
  isOpen         = model(false);                               // two-way bindable
}
```

### `[kuiFieldDropdown]`

Convenience directive that combines `kuiDropdown` + `kui-field` wiring: adds chevron icon to field suffix, activates field focus ring when open, forwards click on field to open/close.

```ts
@Directive({ selector: 'kui-field[kuiFieldDropdown]' })
export class KuiFieldDropdownDirective {
  kuiFieldDropdown = input<TemplateRef<unknown> | null>(null);
  placement        = input<KuiPlacement>('bottom-start');
  isOpen           = model(false);
}
```

## Usage

### Basic (trigger + panel)

```html
<button [kuiDropdown]="panel" type="button">Open</button>

<ng-template #panel>
  <div class="kui-dropdown-panel">
    Any content here
  </div>
</ng-template>
```

### Wired to kui-field (Select / Combobox pattern)

```html
<kui-field [kuiFieldDropdown]="listbox">
  <input kuiInput readonly [value]="selectedLabel()" placeholder="Select…" />
</kui-field>

<ng-template #listbox>
  <div class="kui-listbox" role="listbox">
    @for (opt of options(); track opt.value) {
      <div class="kui-listbox-option" role="option" (click)="select(opt)">
        {{ opt.label }}
      </div>
    }
  </div>
</ng-template>
```

### Fully custom (user-side)

```html
<kui-field [kuiFieldDropdown]="colorPicker">
  <input kuiInput readonly [value]="color()" />
</kui-field>

<ng-template #colorPicker>
  <my-color-wheel [(color)]="color" />
</ng-template>
```

## Select refactor plan

When Dropdown ships:

1. `KuiSelectComponent` keeps its public API unchanged (`[options]`, `[(value)]`, `[placeholder]`, etc.)
2. Internals swap: `position: fixed` + manual scroll handler → `[kuiFieldDropdown]`
3. `KuiSelectGroupTpl` and `KuiSelectItemTpl` directives stay — they live in Select, not Dropdown

## CSS tokens

Panel appearance is defined by Dropdown tokens (shared across Select, Menu, Popover):

```css
--kui-dropdown-bg
--kui-dropdown-border
--kui-dropdown-radius
--kui-dropdown-shadow
--kui-dropdown-z-index
```

## Placement enum

```ts
type KuiPlacement =
  | 'bottom-start' | 'bottom-end' | 'bottom'
  | 'top-start'    | 'top-end'    | 'top';
```

Viewport collision detection: if chosen placement clips panel, flip to opposite side.
