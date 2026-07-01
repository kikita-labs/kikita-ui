/** Side from which the drawer enters the viewport. */
export type KuiDrawerSide = 'right' | 'left' | 'bottom' | 'top';

/** Drawer size preset. Width for left/right drawers, height for top/bottom drawers. */
export type KuiDrawerSize = 'sm' | 'md' | 'lg' | 'full';

/** Options passed to {@link KuiDrawerService.open} or {@link kuiDrawer}. */
export interface KuiDrawerConfig<TData = unknown> {
  /** Arbitrary data injected into the drawer component via {@link KUI_DRAWER_CONTEXT}. */
  data?: TData;
  /** Drawer side. Defaults to `'right'`. */
  side?: KuiDrawerSide;
  /** Drawer size preset. Defaults to `'md'`. */
  size?: KuiDrawerSize;
  /** Allow closing via backdrop click. Defaults to `true`. */
  closeOnBackdropClick?: boolean;
  /** Allow closing via Escape key. Defaults to `true`. */
  closeOnEscape?: boolean;
  /** Show the close button in examples and context-aware components. Defaults to `true`. */
  closable?: boolean;
}
