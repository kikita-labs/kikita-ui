import { inject, Injector, Type } from '@angular/core';
import { Observable } from 'rxjs';

import { KuiDrawerHost } from './kui-drawer-context.token';
import { KuiDrawerService } from './kui-drawer.service';
import { KuiDrawerConfig } from './kui-drawer.types';

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
  const service = inject(KuiDrawerService);
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
