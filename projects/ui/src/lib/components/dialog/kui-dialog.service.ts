import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import type { Type } from '@angular/core';
import { inject, Injector, Service } from '@angular/core';

import type { Observable } from 'rxjs';

import type { KuiDialogConfig } from './kui-dialog.types';
import { KuiDialogContainerComponent } from './kui-dialog-container.component';
import type { KuiDialogContext, KuiDialogHost } from './kui-dialog-context.token';
import { KUI_DIALOG_CONTEXT } from './kui-dialog-context.token';
import { KuiDialogRef } from './kui-dialog-ref';

type FocusableElement = Element & { focus: () => void };

/**
 * @internal
 * Low-level service that attaches dialog components to a CDK overlay.
 * Consumers should use {@link kuiDialog} instead of injecting this directly.
 */
@Service()
export class KuiDialogService {
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
    const size = config.size ?? 'md';
    const appearance = config.appearance ?? 'default';
    const dismissable = config.dismissable ?? true;
    const closable = config.closable ?? true;
    const previouslyFocused = getFocusableElement(this.document.activeElement);

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

function getFocusableElement(element: Element | null): FocusableElement | null {
  if (!element || typeof (element as Partial<FocusableElement>).focus !== 'function') {
    return null;
  }

  return element as FocusableElement;
}
