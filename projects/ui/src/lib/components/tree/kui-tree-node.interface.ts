/** Toggle behavior of a `kui-tree`: single-selection navigation or multi-select checkboxes. */
export type KuiTreeMode = 'display' | 'checkable';

/**
 * A single node in a `kui-tree` data source.
 *
 * `icon` only supports the built-in folder/file glyphs from the Kikita Design
 * Tree spec; a custom per-node icon template is not implemented.
 */
export interface KuiTreeNode<T = unknown> {
  /** Unique node id, stable across renders. */
  readonly id: string;
  /** Visible label; truncated with an ellipsis when it overflows. */
  readonly label: string;
  /** Built-in icon glyph. Omit for no icon. */
  readonly icon?: 'folder' | 'file';
  /** Child nodes. Ignored while a `lazy` node's children haven't loaded yet. */
  readonly children?: readonly KuiTreeNode<T>[];
  /** Grays the node out; it cannot be expanded, selected, or checked. */
  readonly disabled?: boolean;
  /** Marks the node's children as loaded on demand via `KuiTreeComponent.loadChildren`. */
  readonly lazy?: boolean;
  /** Arbitrary consumer payload carried alongside the node. */
  readonly data?: T;
}
