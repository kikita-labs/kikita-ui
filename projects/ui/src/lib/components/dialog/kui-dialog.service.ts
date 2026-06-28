import { inject, Injector, Service, Type } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Observable } from 'rxjs';

import { KuiDialogContainerComponent } from './kui-dialog-container.component';
import { KUI_DIALOG_CONTEXT, KuiDialogContext, KuiDialogHost } from './kui-dialog-context.token';
import { KuiDialogRef } from './kui-dialog-ref';
import { KuiDialogConfig } from './kui-dialog.types';

/**
 * @internal
 * Low-level service that attaches dialog components to a CDK overlay.
 * Consumers should use {@link kuiDialog} instead of injecting this directly.
 */
@Service()
export class KuiDialogService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);

  /**
   * Open `component` in a modal dialog overlay.
   * Returns an observable that emits the result once the dialog closes.
   */
  open<TResult = void, TData = unknown>(
    component: Type<KuiDialogHost<TResult, TData>>,
    config: KuiDialogConfig<TData> & { injector?: Injector },
  ): Observable<TResult | undefined> {
    const ref = new KuiDialogRef<TResult>();
    const size = config.size ?? 'md';
    const appearance = config.appearance ?? 'default';
    const dismissable = config.dismissable ?? true;
    const closable = config.closable ?? true;

    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: false,
    });

    let container: KuiDialogContainerComponent | null = null;

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
      new ComponentPortal(KuiDialogContainerComponent, null, childInjector),
    );
    container = containerRef.instance;
    container._size = size;
    container._appearance = appearance;
    container._dismissable = dismissable;

    container.closed.subscribe((result) => {
      ref._complete(result as TResult | undefined);
      overlayRef.detach();
      overlayRef.dispose();
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
