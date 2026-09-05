# Chip

`[kuiChip]` styles compact selected values, filter tokens, tags, and entity references.

Chip is different from Badge:

- Badge describes status.
- Chip represents a chosen value or removable filter.

## Import

```ts
import { KuiChipDirective, KuiChipRemoveDirective } from '@kikita-labs/ui';
```

Import runtime styles once:

```ts
import '@kikita-labs/ui/styles';
```

## Usage

```html
<span kuiChip>Design</span>

<!-- Primary way to make a chip removable: the `removable` input renders a default
     crossmark button and wires up `removed` for you. -->
<span
  kuiChip
  size="sm"
  appearance="primary"
  removable
  removeLabel="Remove Design"
  (removed)="removeTag('design')"
>
  <span class="kui-chip-label">Design</span>
</span>

<button kuiChip type="button">Filter</button>
```

Only reach for `button[kuiChipRemove]` when the default button in `removable` isn't
enough — a custom icon, extra markup, or a design that needs a fully custom remove
control. It's a behavior-only directive (click handling, ARIA wiring) with no visual
of its own: project whatever content you want as the button's children, for example a
`kuiIconButton`:

```html
<span kuiChip size="sm" appearance="primary" (removed)="removeTag('design')">
  <span class="kui-chip-label">Design</span>
  <button kuiChipRemove kuiIconButton icon="x" size="xs" aria-label="Remove Design"></button>
</span>
```

`kuiIconButton` is its own directive; import `KuiIconButtonDirective` alongside
`KuiChipDirective`/`KuiChipRemoveDirective` to use this pattern. See [Icon
Button](icon-button.md).

Do not combine `removable` and a projected `button[kuiChipRemove]` on the same chip —
pick one.

## Inputs

| Input         | Type                                                                     | Default     | Notes                                                                                                                    |
| ------------- | ------------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| `appearance`  | `'neutral' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'neutral'` | Semantic visual treatment.                                                                                               |
| `size`        | `'xs' \| 'sm' \| 'md' \| 'lg'`                                           | `'md'`      | Use `sm` inside Select and Combobox controls.                                                                            |
| `disabled`    | `boolean`                                                                | `false`     | Reduces opacity and makes the remove action inert.                                                                       |
| `invalid`     | `boolean`                                                                | `false`     | Shows the invalid border treatment.                                                                                      |
| `removable`   | `boolean`                                                                | `false`     | Renders a default crossmark remove button as last child.                                                                 |
| `removeLabel` | `string \| undefined`                                                    | `undefined` | Accessible name for the `removable` button. Falls back to `"Remove"` when omitted — pass a value-specific label instead. |

## Outputs

| Output    | Type   | Notes                                                                               |
| --------- | ------ | ----------------------------------------------------------------------------------- |
| `removed` | `void` | Emitted when the `removable` button or a nested `button[kuiChipRemove]` is clicked. |

## Accessibility

- Static chip: use a non-interactive host such as `span`.
- Interactive chip: use a native `button` or `a`.
- Remove action is a native `<button>`, either the `removable` default or a projected
  `button[kuiChipRemove]`.
- Give the remove button an accessible name: `removeLabel` for `removable`, or an
  explicit `aria-label` such as `aria-label="Remove Design"` on a custom
  `button[kuiChipRemove]`.
- Disabled chips mark remove buttons as `aria-disabled="true"` and `tabindex="-1"`.
- Select and Combobox own keyboard behavior for Delete/Backspace selected-value removal.

## Tokens

Chip uses `--kui-chip-*` variables for dimensions, text, border, background, remove action, focus ring, and disabled opacity.

Core tokens:

- `--kui-chip-bg`
- `--kui-chip-bg-hover`
- `--kui-chip-border`
- `--kui-chip-text`
- `--kui-chip-radius`
- `--kui-chip-height-xs`
- `--kui-chip-height-sm`
- `--kui-chip-height-md`
- `--kui-chip-height-lg`
- `--kui-chip-remove-color`
- `--kui-chip-remove-color-hover`
- `--kui-chip-disabled-opacity`
