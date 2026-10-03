/** Defaults for `kui-dropdown`, set under the `dropdown` key of the component defaults. */
export interface KuiDropdownOptions {
  /** Maximum panel height as a CSS length, or `null` for no limit. */
  readonly maxHeight?: string | null;

  /** Gap in px between the anchor and the panel edge. */
  readonly offset?: number;

  /** Closes the panel when a selectable option is clicked. */
  readonly closeOnSelect?: boolean;

  /** Panel width relative to the anchor. */
  readonly panelWidth?: 'anchor' | 'content' | 'auto';
}
