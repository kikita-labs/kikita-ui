import { InjectionToken } from '@angular/core';
import type { KuiDialogAppearance } from './kui-dialog.types';

/**
 * Injected into every dialog component opened via {@link kuiDialog}.
 * Provides typed access to input data and the close callback.
 */
export interface KuiDialogContext<TResult = void, TData = unknown> {
  /** Data passed through {@link KuiDialogConfig.data}. */
  readonly data: TData;
  /** Whether the × close button is shown (mirrors {@link KuiDialogConfig.closable}). */
  readonly closable: boolean;
  /** Visual intent (mirrors {@link KuiDialogConfig.appearance}). Use to conditionally render `.kui-dialog-icon`. */
  readonly appearance: KuiDialogAppearance;
  /** Close the dialog, optionally resolving with a result value. */
  close(result?: TResult): void;
}

/**
 * Structural contract for components that can be opened as a dialog.
 * The `dialogContext` field **must** be `public` — TypeScript enforces this
 * at the `kuiDialog()` call site.
 */
export interface KuiDialogHost<TResult = void, TData = unknown> {
  readonly dialogContext: KuiDialogContext<TResult, TData>;
}

/** @internal Injection token that carries {@link KuiDialogContext} into dialog components. */
export const KUI_DIALOG_CONTEXT = new InjectionToken<KuiDialogContext<unknown, unknown>>(
  'KUI_DIALOG_CONTEXT',
);
