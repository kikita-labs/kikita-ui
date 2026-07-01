import { InjectionToken } from '@angular/core';

import type { KuiDrawerSide, KuiDrawerSize } from './kui-drawer.types';

/**
 * Injected into every drawer component opened via {@link kuiDrawer}.
 * Provides typed access to input data, placement metadata, and the close callback.
 */
export interface KuiDrawerContext<TResult = void, TData = unknown> {
  /** Data passed through {@link KuiDrawerConfig.data}. */
  readonly data: TData;
  /** Drawer side resolved from config. */
  readonly side: KuiDrawerSide;
  /** Drawer size resolved from config. */
  readonly size: KuiDrawerSize;
  /** Whether close affordances should be rendered by context-aware content. */
  readonly closable: boolean;
  /** Close the drawer, optionally resolving with a result value. */
  close(result?: TResult): void;
}

/**
 * Structural contract for components that can be opened as a drawer.
 * The `drawerContext` field must be public so TypeScript can validate it at the `kuiDrawer()` call site.
 */
export interface KuiDrawerHost<TResult = void, TData = unknown> {
  readonly drawerContext: KuiDrawerContext<TResult, TData>;
}

/** @internal Injection token that carries {@link KuiDrawerContext} into drawer components. */
export const KUI_DRAWER_CONTEXT = new InjectionToken<KuiDrawerContext<unknown, unknown>>(
  'KUI_DRAWER_CONTEXT',
);
