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

<span kuiChip size="sm" appearance="primary" (removed)="removeTag('design')">
  <span class="kui-chip-label">Design</span>
  <button kuiChipRemove aria-label="Remove Design">...</button>
</span>

<button kuiChip type="button">Filter</button>
```

## Inputs

| Input        | Type                                                                     | Default     | Notes                                              |
| ------------ | ------------------------------------------------------------------------ | ----------- | -------------------------------------------------- |
| `appearance` | `'neutral' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'neutral'` | Semantic visual treatment.                         |
| `size`       | `'xs' \| 'sm' \| 'md' \| 'lg'`                                           | `'md'`      | Use `sm` inside Select and Combobox controls.      |
| `disabled`   | `boolean`                                                                | `false`     | Reduces opacity and makes the remove action inert. |
| `invalid`    | `boolean`                                                                | `false`     | Shows the invalid border treatment.                |

## Outputs

| Output    | Type   | Notes                                                     |
| --------- | ------ | --------------------------------------------------------- |
| `removed` | `void` | Emitted when a nested `button[kuiChipRemove]` is clicked. |

## Accessibility

- Static chip: use a non-interactive host such as `span`.
- Interactive chip: use a native `button` or `a`.
- Remove action must be a native `button[kuiChipRemove]`.
- Remove buttons need an accessible name such as `aria-label="Remove Design"`.
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
