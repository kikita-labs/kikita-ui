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

### Pill variant

```html
<kui-tabs variant="pill" [(selected)]="activeTab">
  ...
</kui-tabs>
```

## Inputs — `kui-tabs`

- `variant`: `line | pill` (default: `line`)
- `size`: `xs | sm | md | lg` (default: `md`)
- `selected`: two-way model — value of the active tab

## Inputs — `[kuiTab]`

- `value`: `string` — identifier for this tab trigger
- `disabled`: `boolean`

## Inputs — `[kuiTabPanel]`

- `value`: `string` — identifier matching a `[kuiTab]`

## Keyboard

| Key | Action |
| --- | --- |
| `←` / `→` | Move focus between tabs |
| `Home` | Focus first tab |
| `End` | Focus last tab |

## Accessibility

- `role="tablist"` on the list container
- `role="tab"` on each trigger, `aria-selected`, roving `tabindex`
- `role="tabpanel"` on each panel

## Overflow

At `< 480px` the tablist scrolls horizontally with scroll-snap.

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
