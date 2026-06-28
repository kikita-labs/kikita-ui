import { inject, Injector, Type } from '@angular/core';
import { Observable } from 'rxjs';

import { KuiDialogHost } from './kui-dialog-context.token';
import { KuiDialogService } from './kui-dialog.service';
import { KuiDialogConfig } from './kui-dialog.types';

/** Infer the result type from a {@link KuiDialogHost} component. */
export type InferDialogResult<TComponent> =
  TComponent extends KuiDialogHost<infer TResult, unknown> ? TResult : never;

/** Infer the data type from a {@link KuiDialogHost} component. */
export type InferDialogData<TComponent> =
  TComponent extends KuiDialogHost<unknown, infer TData> ? TData : never;

/**
 * Inject-function factory for opening a typed dialog.
 *
 * Call once during injection context (constructor / field initialiser) to get
 * a reusable opener function. TypeScript infers `TResult` and `TData`
 * automatically from the component's `dialogContext` type.
 *
 * @example
 * ```ts
 * export function injectEditUserDialog() {
 *   return kuiDialog(EditUserDialog, { size: 'md' });
 * }
 *
 * class MyPage {
 *   private openEditUser = injectEditUserDialog();
 *
 *   edit(user: User) {
 *     this.openEditUser({ userId: user.id })
 *       .pipe(takeUntilDestroyed())
 *       .subscribe(result => { if (result === 'saved') this.reload(); });
 *   }
 * }
 * ```
 */
export function kuiDialog<TComponent extends KuiDialogHost<unknown, unknown>>(
  component: Type<TComponent>,
  config?: Omit<KuiDialogConfig, 'data'>,
): (data: InferDialogData<TComponent>) => Observable<InferDialogResult<TComponent> | undefined> {
  const service = inject(KuiDialogService);
  const injector = inject(Injector);
  return (data: InferDialogData<TComponent>) =>
    service.open(
      component as Type<KuiDialogHost<InferDialogResult<TComponent>, InferDialogData<TComponent>>>,
      {
        ...config,
        data,
        injector,
      },
    );
}
