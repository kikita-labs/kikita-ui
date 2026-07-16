# Tabs

`kui-tabs` is a compound component for tabbed navigation. It coordinates tab triggers and panels through a shared DI context.

## Import

```ts
import { KuiTabsComponent, KuiTabDirective, KuiTabPanelDirective } from '@kikita-labs/ui';
```

## Usage

```html
<kui-tabs [(selected)]="activeTab">
  <button kuiTab value="overview">Overview</button>
  <button kuiTab value="settings">Settings</button>
  <button kuiTab value="logs">Logs</button>

  <div kuiTabPanel value="overview">Overview content</div>
  <div kuiTabPanel value="settings">Settings content</div>
  <div kuiTabPanel value="logs">Log content</div>
</kui-tabs>
```

### Pill Variant

```html
<kui-tabs variant="pill" [(selected)]="activeTab"> ... </kui-tabs>
```

### Inverted Edge

Use `inverted` when the tab list should sit on the opposite edge of the panels.
Horizontal tabs render panels above the tab list and place the line indicator on
the top edge. Vertical tabs render panels before the tab list and place the line
indicator on the start edge.

```html
<kui-tabs inverted [(selected)]="activeTab">
  <button kuiTab value="details">Details</button>
  <button kuiTab value="history">History</button>

  <div kuiTabPanel value="details">Details content</div>
  <div kuiTabPanel value="history">History content</div>
</kui-tabs>

<kui-tabs orientation="vertical" inverted [(selected)]="activeTab">
  <button kuiTab value="details">Details</button>
  <button kuiTab value="history">History</button>

  <div kuiTabPanel value="details">Details content</div>
  <div kuiTabPanel value="history">History content</div>
</kui-tabs>
```

### Router Navigation

Use `controlsPanels="false"` when `kui-tabs` is used as navigation and the routed page content is rendered by `router-outlet` instead of local `kuiTabPanel` elements.

```html
<kui-tabs [(selected)]="currentRoute" [controlsPanels]="false" aria-label="Sections">
  <button kuiTab value="/overview">Overview</button>
  <button kuiTab value="/settings">Settings</button>
</kui-tabs>
```

## Inputs - `kui-tabs`

- `variant`: `line | pill` (default: `line`)
- `size`: `xs | sm | md | lg` (default: `md`)
- `orientation`: `horizontal | vertical` (default: `horizontal`)
- `inverted`: `boolean` (default: `false`). Flips the tab edge: horizontal panels render above the list; vertical panels render before the list.
- `selected`: two-way model, value of the active tab
- `controlsPanels`: `boolean` (default: `true`). Set to `false` when tabs do not render local `kuiTabPanel` elements.

## Inputs - `[kuiTab]`

- `value`: `string`, identifier for this tab trigger

## Inputs - `[kuiTabPanel]`

- `value`: `string`, identifier matching a `[kuiTab]`

## Keyboard

| Key                        | Action                  |
| -------------------------- | ----------------------- |
| `ArrowLeft` / `ArrowRight` | Move focus between tabs |
| `Home`                     | Focus first tab         |
| `End`                      | Focus last tab          |

## Accessibility

- `role="tablist"` on the list container
- `role="tab"` on each trigger, with `aria-selected` and roving `tabindex`
- `role="tabpanel"` on each panel
- `aria-controls` is emitted by default and should point to a matching `[kuiTabPanel]`
- Use `[controlsPanels]="false"` only for navigation-style tabs without local panels

## Overflow

At narrow widths, the tablist scrolls horizontally and exposes accessible scroll buttons when needed.

## CSS Variables

- `--kui-tabs-gap`
- `--kui-tabs-border`
- `--kui-tabs-panel-gap`
- `--kui-tab-height`
- `--kui-tab-px`
- `--kui-tab-gap`
- `--kui-tab-radius`
- `--kui-tab-fg`
- `--kui-tab-fg-hover`
- `--kui-tab-bg-hover`
- `--kui-tab-fg-active`
- `--kui-tab-indicator`
- `--kui-tab-font-size`
- `--kui-tab-font-weight`
- `--kui-tab-font-weight-active`
- `--kui-tab-pill-gap`
- `--kui-tab-pill-radius`
- `--kui-tab-pill-bg-hover`
- `--kui-tab-pill-bg-active`
- `--kui-tab-pill-fg-active`
