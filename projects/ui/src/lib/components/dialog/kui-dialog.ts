import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import type { Type } from '@angular/core';
import { inject, Injector, Service } from '@angular/core';

import type { Observable } from 'rxjs';

import { KuiDefaults } from '../../providers/kui-defaults';
import { getFocusableElement } from '../../utils/kui-focusable-element.util';
import type { KuiDialogConfig } from './kui-dialog.types';
import { KuiDialogContainer } from './kui-dialog-container';
import type { KuiDialogContext, KuiDialogHost } from './kui-dialog-context.token';
import { KUI_DIALOG_CONTEXT } from './kui-dialog-context.token';
import { KuiDialogRef } from './kui-dialog-ref';

/**
 * @internal
 * Low-level service that attaches dialog components to a CDK overlay.
 * Consumers should use {@link kuiDialog} instead of injecting this directly.
 */
@Service()
export class KuiDialog {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);

  /**
   * Open `component` in a modal dialog overlay.
   * Returns an observable that emits the result once the dialog closes.
   */
  open<TResult = void, TData = unknown>(
    component: Type<KuiDialogHost<TResult, TData>>,
    config: KuiDialogConfig<TData> & { injector?: Injector },
  ): Observable<TResult | undefined> {
    const ref = new KuiDialogRef<TResult>();
    const defaults = (config.injector ?? this.injector).get(KuiDefaults).effective().dialog;
    const size = config.size ?? defaults?.size ?? 'md';
    const appearance = config.appearance ?? defaults?.appearance ?? 'default';
    const dismissable = config.dismissable ?? defaults?.dismissable ?? true;
    const closable = config.closable ?? defaults?.closable ?? true;
    const previouslyFocused = getFocusableElement(this.document.activeElement);

    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: false,
    });

    let container: KuiDialogContainer | null = null;

    const context: KuiDialogContext<TResult, TData> = {
      data: (config.data ?? undefined) as TData,
      closable,
      appearance,
      close: (result?: TResult) => container?.close(result),
    };

    const childInjector = Injector.create({
      parent: config.injector ?? this.injector,
      providers: [{ provide: KUI_DIALOG_CONTEXT, useValue: context }],
    });

    const containerRef = overlayRef.attach(
      new ComponentPortal(KuiDialogContainer, null, childInjector),
    );
    container = containerRef.instance;
    container._size = size;
    container._appearance = appearance;
    container._dismissable = dismissable;
    container._closable.set(closable);

    container.closed.subscribe((result) => {
      overlayRef.detach();
      overlayRef.dispose();
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
      ref._complete(result as TResult | undefined);
    });

    overlayRef.keydownEvents().subscribe((e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissable) {
        e.stopPropagation();
        container?.close();
      }
    });

    container.attachContent(
      new ComponentPortal(component as Type<KuiDialogHost<unknown, unknown>>, null, childInjector),
    );

    return ref.afterClosed();
  }
}

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
  const service = inject(KuiDialog);
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
