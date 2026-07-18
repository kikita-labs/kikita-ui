import type { Observable } from 'rxjs';

/** Visual intent of a toast notification. */
export type KuiToastAppearance = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

/** Position of the toast region within the viewport. */
export type KuiToastPosition =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end';

/** Configuration for a single toast notification. */
export interface KuiToastConfig {
  /** Headline text. Required. */
  title: string;
  /** Optional supporting text below the title. */
  message?: string;
  /** Visual intent — controls accent bar and icon colour. Defaults to `'neutral'`. */
  appearance?: KuiToastAppearance;
  /** Label for the inline action button. When set, clicking it emits on `KuiToastRef.action$`. */
  actionLabel?: string;
  /** Auto-dismiss delay in milliseconds. Defaults to `5000`. Ignored when `persistent` is `true`. */
  duration?: number;
  /** Keep the toast until the user closes it explicitly. Defaults to `false`. */
  persistent?: boolean;
  /** Show the × close button. Defaults to `true`. */
  closable?: boolean;
  /** Show the appearance icon. Neutral appearance has no icon. Defaults to `true`. */
  showIcon?: boolean;
  /** Show a progress bar that tracks time until auto-dismiss. Defaults to `false`. */
  showProgress?: boolean;
}

/** Global defaults applied by {@link KuiToastService.open} before per-call config is merged. */
export interface KuiToastOptions {
  /** Default position of the toast region. Defaults to `'bottom-center'`. */
  position?: KuiToastPosition;
  /** Default auto-dismiss delay in milliseconds. Defaults to `5000`. */
  duration?: number;
  /** Maximum simultaneously visible toasts before the oldest is evicted. Defaults to `3`. */
  maxVisible?: number;
  /** Default value for `showProgress`. Defaults to `false`. */
  showProgress?: boolean;
  /** Default value for `closable`. Defaults to `true`. */
  closable?: boolean;
  /** Default value for `showIcon`. Defaults to `true`. */
  showIcon?: boolean;
}

/** Handle returned by {@link KuiToastService.open}. */
export interface KuiToastRef {
  /** Programmatically close this toast (triggers the exit animation). */
  close(): void;
  /** Emits once after the close animation finishes, then completes. */
  readonly closed$: Observable<void>;
  /** Emits once when the action button is clicked, then completes. */
  readonly action$: Observable<void>;
}
