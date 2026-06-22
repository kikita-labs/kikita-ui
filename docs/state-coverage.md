# State Coverage

This is the current local playground coverage for public Kikita UI primitives.

## Covered

| Primitive  | Playground route | Covered states or variants                                                 |
| ---------- | ---------------- | -------------------------------------------------------------------------- |
| Button     | `/button`        | default, hover, active, focus, disabled, appearances, sizes                |
| IconButton | `/button`        | default, hover, active, focus, disabled, appearances, sizes                |
| Icon       | `/icons`         | registry icon, direct source, image URL fallback, icon button composition  |
| Field      | `/field`         | label, hint, error, required marker, ARIA description wiring, sizes        |
| Input      | `/input`         | default, hover, focus, error, disabled, sizes                              |
| Textarea   | `/textarea`      | default, error, disabled, native multiline resize behavior                 |
| Checkbox   | `/checkbox`      | unchecked, checked, hover, focus, invalid, disabled, sizes, field wiring   |
| Switch     | `/switch`        | off, on, hover, focus, invalid, disabled, sizes, field wiring              |
| Radio      | `/radio`         | unchecked, checked, hover, focus, invalid, disabled, sizes, field wiring   |
| Badge      | `/badge`         | neutral, primary, success, warning, danger, info, sizes, host elements     |
| Loader     | `/loader`        | sizes, standalone status, button composition                               |
| Card       | `/card`          | surface, elevated, sunken, interactive button-backed card, sizes           |
| Group      | `/group`         | horizontal, vertical, collapsed, icon composition                          |
| Tabs       | `/tabs`          | line, pill, selected, hover, focus, disabled, sizes, overflow scroll       |
| Tooltip    | `/tooltip`       | hover/focus trigger, top/right/bottom/left placement, empty text guard     |
| Segmented  | `/segmented`     | selected, focus, disabled, sizes, keyboard navigation preview              |
| Table      | `/table`         | sizes, sortable headers, selection cells, sticky header/column composition |
| Density    | `/density`       | compact, regular, comfortable scopes, constrained mobile preview           |

## Current Gaps

- Browser screenshot baselines are still local-only, not committed visual regression tests.
- Full accessibility review is still needed for newer composite primitives, especially Table, Tooltip, Tabs, and Segmented.
