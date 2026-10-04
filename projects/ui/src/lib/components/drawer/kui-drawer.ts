import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import type { Type } from '@angular/core';
import { inject, Injector, Service } from '@angular/core';

import type { Observable } from 'rxjs';

import { KuiDefaults } from '../../providers/kui-defaults';
import { getFocusableElement } from '../../utils/kui-focusable-element.util';
import type { KuiDrawerConfig } from './kui-drawer.types';
import { KuiDrawerContainer } from './kui-drawer-container';
import type { KuiDrawerContext, KuiDrawerHost } from './kui-drawer-context.token';
import { KUI_DRAWER_CONTEXT } from './kui-drawer-context.token';
import { KuiDrawerRef } from './kui-drawer-ref';

/**
 * @internal
 * Low-level service that attaches drawer components to a CDK overlay.
 * Consumers should use {@link kuiDrawer} instead of injecting this directly.
 */
@Service()
export class KuiDrawer {
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
    const defaults = (config.injector ?? this.injector).get(KuiDefaults).effective().drawer;
    const side = config.side ?? defaults?.side ?? 'right';
    const size = config.size ?? defaults?.size ?? 'md';
    const closeOnBackdropClick =
      config.closeOnBackdropClick ?? defaults?.closeOnBackdropClick ?? true;
    const closeOnEscape = config.closeOnEscape ?? defaults?.closeOnEscape ?? true;
    const closable = config.closable ?? defaults?.closable ?? true;
    const previouslyFocused = getFocusableElement(this.document.activeElement);

    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().top('0').left('0'),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: false,
    });

    let container: KuiDrawerContainer | null = null;

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
      new ComponentPortal(KuiDrawerContainer, null, childInjector),
    );
    container = containerRef.instance;
    container._side = side;
    container._size = size;
    container._closeOnBackdropClick = closeOnBackdropClick;
    container._closable.set(closable);

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

/** Infer the result type from a {@link KuiDrawerHost} component. */
export type InferDrawerResult<TComponent> =
  TComponent extends KuiDrawerHost<infer TResult, unknown> ? TResult : never;

/** Infer the data type from a {@link KuiDrawerHost} component. */
export type InferDrawerData<TComponent> =
  TComponent extends KuiDrawerHost<unknown, infer TData> ? TData : never;

/**
 * Inject-function factory for opening a typed drawer.
 *
 * Call once during an injection context to get a reusable opener function.
 * TypeScript infers `TResult` and `TData` from the component's `drawerContext` type.
 */
export function kuiDrawer<TComponent extends KuiDrawerHost<unknown, unknown>>(
  component: Type<TComponent>,
  config?: Omit<KuiDrawerConfig, 'data'>,
): (data: InferDrawerData<TComponent>) => Observable<InferDrawerResult<TComponent> | undefined> {
  const service = inject(KuiDrawer);
  const injector = inject(Injector);
  return (data: InferDrawerData<TComponent>) =>
    service.open(
      component as Type<KuiDrawerHost<InferDrawerResult<TComponent>, InferDrawerData<TComponent>>>,
      {
        ...config,
        data,
        injector,
      },
    );
}
