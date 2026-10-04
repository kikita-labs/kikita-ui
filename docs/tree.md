# Tree

`kui-tree` renders a hierarchical, expandable node list. It supports `display`
mode (single-selection navigation) and `checkable` mode (a checkbox per node
with indeterminate cascading), lazy-loaded children, and full keyboard
navigation.

## Import

```ts
import { KuiTreeComponent } from '@kikita-labs/ui';
```

## Usage

```html
<kui-tree ariaLabel="Project explorer" [data]="nodes" [(value)]="selectedId" />
```

```ts
protected readonly nodes: KuiTreeNode[] = [
  {
    id: 'src',
    label: 'src',
    icon: 'folder',
    children: [
      { id: 'main-ts', label: 'main.ts', icon: 'file' },
      { id: 'readme', label: 'README.md', icon: 'file' },
    ],
  },
];
protected readonly selectedId = signal<string | null>(null);
```

## Checkable Mode

```html
<kui-tree ariaLabel="File selection" mode="checkable" [data]="nodes" [(checkedIds)]="checkedIds" />
```

Checking a node cascades the same checked value onto all of its non-disabled
descendants. A parent node shows `aria-checked="mixed"` (checkbox
`indeterminate`) whenever its descendants are not all checked or all
unchecked — including when a disabled descendant's own state keeps it out of
sync with its siblings.

## Lazy Loading

```html
<kui-tree [data]="nodes" [loadChildren]="loadChildren" [(expandedIds)]="expandedIds" />
```

```ts
protected readonly loadChildren = (node: KuiTreeNode): Promise<KuiTreeNode[]> =>
  fetchChildren(node.id);
```

Mark a node `lazy: true` with no `children`. The first time it's expanded
(click, Enter/Space, or ArrowRight), `loadChildren` is called once and the
node shows a spinner in place of the toggle chevron until it resolves. The
result is cached for the node's lifetime in this tree instance.

## Inputs

| Input          | Type                                                     | Default              | Notes                                                                                                          |
| -------------- | -------------------------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------- |
| `mode`         | `'display' \| 'checkable'`                               | `'display'`          | Click behavior and whether checkboxes render.                                                                  |
| `size`         | `KuiSize`                                                | `'md'`               | Row height/text size; only `sm`/`md`/`lg` have dedicated styling.                                              |
| `data`         | `readonly KuiTreeNode[]`                                 | `[]`                 | Root nodes.                                                                                                    |
| `ariaLabel`    | `string`                                                 | `tree.label` message | Accessible name for the `role="tree"` container.                                                               |
| `mobile`       | `boolean`                                                | `false`              | Enlarges the toggle tap target to 44x44px.                                                                     |
| `value`        | `string \| null`                                         | `null`               | Controlled selected node id (`display` mode). Two-way (`valueChange`).                                         |
| `selected`     | `string \| null`                                         | `null`               | **Deprecated**, use `value` instead. Kept in sync with `value`; planned for removal in the next major version. |
| `checkedIds`   | `string[]`                                               | `[]`                 | Controlled checked node ids (`checkable` mode). Two-way (`checkedIdsChange`).                                  |
| `expandedIds`  | `string[]`                                               | `[]`                 | Controlled expanded node ids. Two-way (`expandedIdsChange`).                                                   |
| `loadChildren` | `(node: KuiTreeNode) => Promise<readonly KuiTreeNode[]>` | —                    | Called once per `lazy` node the first time it's expanded.                                                      |

### `KuiTreeNode`

| Field      | Type                     | Notes                                                                    |
| ---------- | ------------------------ | ------------------------------------------------------------------------ |
| `id`       | `string`                 | Unique, stable node id.                                                  |
| `label`    | `string`                 | Visible text; truncated with an ellipsis when it overflows.              |
| `icon`     | `'folder' \| 'file'`     | Optional built-in glyph. Folder icon reflects expanded/collapsed.        |
| `children` | `readonly KuiTreeNode[]` | Child nodes.                                                             |
| `disabled` | `boolean`                | Not expandable, selectable, or checkable; still reachable by arrow keys. |
| `lazy`     | `boolean`                | Children are fetched via `loadChildren` on first expand.                 |
| `data`     | `T`                      | Arbitrary consumer payload.                                              |

## Keyboard

| Key            | Action                                                                               |
| -------------- | ------------------------------------------------------------------------------------ |
| `↓` / `↑`      | Move to the next/previous visible node.                                              |
| `→`            | Expand (or lazy-load) a collapsed node; move to the first child if already expanded. |
| `←`            | Collapse an expanded node; move to the parent if collapsed or a leaf.                |
| `Enter`        | Select the focused node (`display` mode).                                            |
| `Space`        | Toggle the checkbox (`checkable`) or expand/collapse (`display`).                    |
| `Home` / `End` | Move to the first/last visible node.                                                 |
| Any letter     | Type-ahead: jump to the next visible node whose label starts with it.                |

Disabled nodes stay reachable by arrow/Home/End/type-ahead navigation; only
`Enter`, `Space`, and click are gated on `!disabled`, so keyboard users are
never trapped on a disabled row.

## Provider Defaults

Set `defaults.tree` once for the application or for a subtree:

```ts
// app.config.ts
provideKikitaUi({
  defaults: {
    tree: {
      /* options below */
    },
  },
});

// a component, route or environment injector
providers: [
  kuiProvideDefaults({
    tree: {
      /* options below */
    },
  }),
];
```

| Option           | Values                         | Description                                                                                                                 |
| ---------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `size`           | `'xs' \| 'sm' \| 'md' \| 'lg'` | Component size. Takes precedence over the global `defaults.size`.                                                           |
| `mode`           | `'display' \| 'checkable'`     | Default mode.                                                                                                               |
| `disclosureIcon` | `KuiIconGlyph`                 | Icon of the expand control. Takes precedence over `defaults.icons.disclosure`. See [Structural Icons](structural-icons.md). |

Each option resolves as `local input > defaults.tree.<option> > built-in default`. See [DI defaults](di-defaults.md).

## Accessibility

`role="tree"` on the root, `role="treeitem"` on every node, `role="group"` on
nested children. `aria-expanded` on nodes with children, `aria-selected`
(`display` mode) or `aria-checked` (`checkable` mode, including `"mixed"`),
`aria-level`/`aria-setsize`/`aria-posinset` for depth and position, and
`aria-disabled="true"` on disabled nodes. Exactly one node is in the tab order
(`tabindex="0"`, roving tabindex); the rest are `tabindex="-1"`.

## Known Gaps

- `icon` only supports the built-in `folder`/`file` glyphs. A custom
  per-node icon `TemplateRef` slot is not implemented.
- No virtualization; very large flattened trees render every visible row.

## Styles

Import the Kikita UI style entrypoint once:

```scss
@import '@kikita-labs/ui/styles';
```

Tree styles live in `projects/ui/src/lib/components/tree/kui-tree.css` and are included through
`@kikita-labs/ui/styles`. Tree rows reuse the existing `.kui-field-action`
(toggle button) and `.kui-checkbox` (checkable mode) styling — no new tokens
are introduced for either.

<!-- color-tokens:begin -->

## Color Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the semantic role in the Default column.

| Token                             | Default                         | Controls             |
| --------------------------------- | ------------------------------- | -------------------- |
| `--kui-tree-row-color`            | `--kui-color-text`              | Row color            |
| `--kui-tree-row-focus-ring-color` | `--kui-color-focus`             | Row focus ring color |
| `--kui-tree-spinner-track-color`  | `--kui-color-surface-sunken`    | Spinner track color  |
| `--kui-tree-spinner-color`        | `--kui-color-primary-indicator` | Spinner color        |

<!-- color-tokens:end -->

<!-- geometry-tokens:begin -->

## Geometry Tokens

Set any of these on the component or an ancestor to restyle one part. Each token is optional: when it
is not set, the part uses the scale token in the Default column.

| Token                           | Default                | Controls            |
| ------------------------------- | ---------------------- | ------------------- |
| `--kui-tree-row-gap`            | `--kui-space-2`        | Row gap             |
| `--kui-tree-row-padding-inline` | `--kui-space-2`        | Row padding, inline |
| `--kui-tree-label-font-size`    | `--kui-text-sm-size`   | Label font size     |
| `--kui-tree-label-font-size-sm` | `--kui-text-xs-size`   | Label font size, sm |
| `--kui-tree-label-font-size-lg` | `--kui-text-base-size` | Label font size, lg |

<!-- geometry-tokens:end -->
