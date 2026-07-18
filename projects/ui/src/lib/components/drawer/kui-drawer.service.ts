import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import type { Type } from '@angular/core';
import { inject, Injector, Service } from '@angular/core';

import type { Observable } from 'rxjs';

import type { KuiDrawerConfig } from './kui-drawer.types';
import { KuiDrawerContainerComponent } from './kui-drawer-container.component';
import type { KuiDrawerContext, KuiDrawerHost } from './kui-drawer-context.token';
import { KUI_DRAWER_CONTEXT } from './kui-drawer-context.token';
import { KuiDrawerRef } from './kui-drawer-ref';

type FocusableElement = Element & { focus: () => void };

/**
 * @internal
 * Low-level service that attaches drawer components to a CDK overlay.
 * Consumers should use {@link kuiDrawer} instead of injecting this directly.
 */
@Service()
export class KuiDrawerService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);

  /**
   * Open `component` in a modal drawer overlay.
   * Returns an observable that emits the result once the drawer closes.
   */
  open<TResult = void, TData = unknown>(
    component: Type<KuiDrawerHost<TResult, TData>>,
    config: KuiDrawerConfig<TData> & { injector?: Injector },
  ): Observable<TResult | undefined> {
    const ref = new KuiDrawerRef<TResult>();
    const side = config.side ?? 'right';
    const size = config.size ?? 'md';
    const closeOnBackdropClick = config.closeOnBackdropClick ?? true;
    const closeOnEscape = config.closeOnEscape ?? true;
    const closable = config.closable ?? true;
    const previouslyFocused = getFocusableElement(this.document.activeElement);

    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().top('0').left('0'),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: false,
    });

    let container: KuiDrawerContainerComponent | null = null;

    const context: KuiDrawerContext<TResult, TData> = {
      data: (config.data ?? undefined) as TData,
      side,
      size,
      closable,
      close: (result?: TResult) => container?.close(result),
    };

    const childInjector = Injector.create({
      parent: config.injector ?? this.injector,
      providers: [{ provide: KUI_DRAWER_CONTEXT, useValue: context }],
    });

    const containerRef = overlayRef.attach(
      new ComponentPortal(KuiDrawerContainerComponent, null, childInjector),
    );
    container = containerRef.instance;
    container._side = side;
    container._size = size;
    container._closeOnBackdropClick = closeOnBackdropClick;

    container.closed.subscribe((result) => {
      overlayRef.detach();
      overlayRef.dispose();
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
      ref._complete(result as TResult | undefined);
    });

    overlayRef.keydownEvents().subscribe((event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        event.stopPropagation();
        container?.close();
      }
    });

    container.attachContent(
      new ComponentPortal(component as Type<KuiDrawerHost<unknown, unknown>>, null, childInjector),
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
