# Empty State

`kui-empty-state` displays a non-blocking no-data, no-results, error, no-access, or success state
inside a known UI region.

## Import

```ts
import {
  KuiButtonDirective,
  KuiEmptyStateActionsDirective,
  KuiEmptyStateComponent,
  KuiEmptyStateIconDirective,
} from '@kikita-labs/ui';
```

## Usage

```html
<kui-empty-state
  heading="No projects yet"
  description="Create the first project to start working with your team."
>
  <svg kuiEmptyStateIcon viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M21 8v13H3V8" />
    <path d="M1 3h22v5H1z" />
    <path d="M10 12h4" />
  </svg>

  <div kuiEmptyStateActions>
    <button kuiButton type="button">Create project</button>
    <button kuiButton appearance="ghost" type="button">Import</button>
  </div>
</kui-empty-state>
```

## Inputs

- `heading`: required empty-state heading text
- `description`: optional supporting text
- `context`: `no-data | no-results | error | no-access | success`
- `size`: `sm | md | lg`

## Slots

- `[kuiEmptyStateIcon]`: decorative icon slot; Kikita marks it `aria-hidden="true"`
- `[kuiEmptyStateActions]`: action slot for native buttons, links, or Kikita button directives

## Accessibility

- Use surrounding page structure for heading hierarchy. The built-in heading is visual text, not a
  forced heading level.
- Decorative icons should use `[kuiEmptyStateIcon]`.
- Use `role="status"` on the `kui-empty-state` host when a no-results state appears dynamically
  after filtering.
- Actions remain normal interactive elements and should use native buttons or links.

## Styling

Import `@kikita-labs/ui/styles` once in the app. Empty State uses `--kui-empty-*` tokens for
spacing, sizing, and text treatment. Context only changes the icon accent.
