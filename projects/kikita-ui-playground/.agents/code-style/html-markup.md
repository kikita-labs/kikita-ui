# HTML Templates

- Prettier is configured with `"htmlWhitespaceSensitivity": "ignore"` — do not fight it by
  hand-wrapping tags differently.
- Sibling tags at the same nesting level always get a blank line between them.

```html
<header>
  <h1>{{ title() }}</h1>
</header>

<main>
  <p>{{ description() }}</p>
</main>
```

- Don't split a tag's open/close onto lines that add nesting noise
  (`<span>\ntext\n</span>` for short inline content) — keep short inline content on one
  line; only break when the content itself is long or block-level.
- Control flow uses the built-in block syntax (`@if`, `@for`, `@switch`), not the legacy
  structural directives (`*ngIf`, `*ngFor`).
- `@for` always has `track` set to a stable identifier, never the index unless the list has
  no stable identity.
- `@for` gets an `@empty` block whenever the empty-list case needs its own UI (empty state,
  "nothing found" message) — don't handle it with a sibling `@if (list.length === 0)`
  instead.
- Use class and style bindings (`[class.active]="isActive()"`, `[style.width.px]="w()"`),
  not `ngClass`/`ngStyle`.

## Review Checklist

- [ ] Blank line between sibling tags at the same level.
- [ ] `@if`/`@for`/`@switch` used, not `*ngIf`/`*ngFor`.
- [ ] `@for` has a real `track` expression.
- [ ] `@for` with an empty-state UI uses `@empty`, not a separate `@if` on the list length.
- [ ] No `ngClass`/`ngStyle`; class/style bindings used instead.
