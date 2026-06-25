# Select

`kui-select` is a custom select component with floating dropdown, keyboard navigation, and grouped options.

> **Note:** Select currently manages its own positioning logic. When the `Dropdown` primitive ships, `KuiSelectComponent` internals will be refactored to use it — the public API will stay unchanged.

## Import

```ts
import { KuiSelectComponent, KuiSelectGroupTpl, KuiSelectItemTpl } from '@kikita-labs/ui';
import type { KuiSelectOption } from '@kikita-labs/ui';
```

## Basic usage

```html
<kui-select [(value)]="role" [options]="roles" placeholder="Select a role…" />
```

```ts
const roles: KuiSelectOption<string>[] = [
  { value: 'engineer', label: 'Software Engineer' },
  { value: 'designer', label: 'Designer' },
];

role = signal<string | undefined>(undefined);
```

## Inputs

| Input         | Type                            | Default     | Description                       |
| ------------- | ------------------------------- | ----------- | --------------------------------- |
| `value`       | `T \| undefined`                | `undefined` | Selected value (two-way bindable) |
| `options`     | `readonly KuiSelectOption<T>[]` | `[]`        | Flat or grouped options array     |
| `placeholder` | `string`                        | `'Select…'` | Shown when no value is selected   |
| `size`        | `'xs' \| 'sm' \| 'md' \| 'lg'`  | `'md'`      | Control size                      |
| `disabled`    | `boolean`                       | `false`     | Disables the trigger              |
| `invalid`     | `boolean`                       | `false`     | Shows error border                |

## Option interface

```ts
interface KuiSelectOption<T = unknown> {
  readonly value: T;
  readonly label: string;
  readonly disabled?: boolean;
  readonly children?: ReadonlyArray<Omit<KuiSelectOption<T>, 'children'>>;
}
```

When `children` is present, the item is treated as a **group header** (not selectable). Grouping is auto-detected — no extra flag needed.

## Grouped options

```ts
const tools: KuiSelectOption<string>[] = [
  {
    value: 'design',
    label: 'Design',
    children: [
      { value: 'figma', label: 'Figma' },
      { value: 'sketch', label: 'Sketch' },
    ],
  },
  {
    value: 'engineering',
    label: 'Engineering',
    children: [{ value: 'vscode', label: 'VS Code' }],
  },
];
```

Flat options and groups can be mixed in the same array. Flat items before any group go into an unlabeled default group.

## Custom group header

Use `kuiSelectGroup` template directive. `$implicit` is the group object `{ label, options }`.

```html
<kui-select [options]="tools" [(value)]="tool">
  <ng-template kuiSelectGroup let-group>
    <kui-icon name="folder" size="12" />
    {{ group.label }}
  </ng-template>
</kui-select>
```

## Custom option item

Use `kuiSelectItem` template directive. `$implicit` is the option object.

```html
<kui-select [options]="users" [(value)]="userId">
  <ng-template kuiSelectItem let-opt>
    <img [src]="opt.avatar" width="20" height="20" style="border-radius:50%" />
    {{ opt.label }}
  </ng-template>
</kui-select>
```

## Sizes

```html
<kui-select size="xs" ... />
<kui-select size="sm" ... />
<kui-select size="md" ... />
<!-- default -->
<kui-select size="lg" ... />
```

## States

```html
<kui-select [invalid]="true" ... /> <kui-select [disabled]="true" ... />
```

## Keyboard navigation

| Key               | Action                             |
| ----------------- | ---------------------------------- |
| `Enter` / `Space` | Open dropdown / select active item |
| `ArrowDown`       | Move focus to next option          |
| `ArrowUp`         | Move focus to previous option      |
| `Escape`          | Close dropdown, return focus       |
| `Tab`             | Close dropdown                     |

## Generic typing

`KuiSelectComponent` is generic. The value type is inferred from `options`:

```ts
// value is signal<number | undefined>
roles: KuiSelectOption<number>[] = [
  { value: 1, label: 'Admin' },
  { value: 2, label: 'User' },
];
```
