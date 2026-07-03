/** A selectable command palette item. */
export interface KuiCommandItem {
  /** Stable command id used for tracking and selection events. */
  readonly id: string;
  /** Primary visible command label. */
  readonly label: string;
  /** Optional supporting description. */
  readonly description?: string;
  /** Optional trailing metadata. */
  readonly meta?: string;
  /** Optional compact badge text. */
  readonly badge?: string;
  /** Optional keyboard shortcut tokens. */
  readonly shortcut?: readonly string[];
  /** Optional decorative icon text or symbol. */
  readonly icon?: string;
  /** Marks the item as destructive. */
  readonly danger?: boolean;
  /** Prevents selection and keyboard focus. */
  readonly disabled?: boolean;
  /** Extra searchable terms. */
  readonly keywords?: readonly string[];
}

/** A command palette item group. */
export interface KuiCommandGroup {
  /** Optional group heading. */
  readonly heading?: string;
  /** Items rendered under this group. */
  readonly items: readonly KuiCommandItem[];
}
