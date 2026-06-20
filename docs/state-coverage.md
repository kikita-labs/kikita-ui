# State Coverage

This is the current local playground coverage for public Kikita UI primitives.

## Covered

| Primitive  | Playground route | Covered states or variants                                             |
| ---------- | ---------------- | ---------------------------------------------------------------------- |
| Button     | `/button`        | default, hover, active, focus, disabled, appearances                   |
| IconButton | `/button`        | default, hover, active, focus, disabled, appearances                   |
| Field      | `/field`         | label, hint, error, required marker, ARIA description wiring           |
| Input      | `/input`         | default, hover, focus, error, disabled, sizes                          |
| Textarea   | `/textarea`      | default, error, disabled, native multiline resize behavior             |
| Checkbox   | `/checkbox`      | unchecked, checked, invalid, disabled, sizes, field wiring             |
| Switch     | `/switch`        | off, on, invalid, disabled, sizes, field wiring                        |
| Radio      | `/radio`         | unchecked, checked, disabled, invalid field wiring, sizes              |
| Badge      | `/badge`         | neutral, primary, success, warning, danger, info, sizes, host elements |
| Loader     | `/loader`        | sizes, standalone status, button composition                           |
| Card       | `/card`          | surface, elevated, sunken, interactive button-backed card              |
| Group      | `/group`         | horizontal, vertical, collapsed, icon composition                      |

## Current Gaps

- Browser screenshot baselines are still local-only, not committed visual regression tests.
- Tooltip, Tabs, and Segmented remain planned Phase 2 primitives, not implemented primitives.
