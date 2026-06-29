/** Current sort key and direction emitted by `kuiTable`. */
export interface KuiSortState {
  /** Application-defined row property or sort key. */
  key: string;

  /** Active sort direction. */
  direction: 'asc' | 'desc';
}
