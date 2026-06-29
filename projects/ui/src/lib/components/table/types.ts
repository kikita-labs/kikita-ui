/** Current sort key and direction used by `kuiTable`; `null` means sorting is cleared. */
export type KuiSortState = KuiActiveSortState | null;

/** Active sort key and direction emitted by `kuiTable`. */
export interface KuiActiveSortState {
  /** Application-defined row property or sort key. */
  key: string;

  /** Active sort direction. */
  direction: 'asc' | 'desc';
}
