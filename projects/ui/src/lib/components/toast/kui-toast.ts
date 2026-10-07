import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import type { ComponentRef } from '@angular/core';
import {
  ApplicationRef,
  createComponent,
  effect,
  EnvironmentInjector,
  inject,
  PLATFORM_ID,
  Service,
} from '@angular/core';

import { EMPTY } from 'rxjs';

import { KuiDefaults } from '../../providers/kui-defaults';
import type { KuiToastConfig, KuiToastRef } from './kui-toast.types';
import { KuiToastRegion } from './kui-toast-region';

const noop = (): void => undefined;

/**
 * Service for displaying toast notifications.
 *
 * Prefer {@link kuiToast} inject-function over injecting this service directly.
 *
 * On the first call the service lazily creates a `<kui-toast-region>` element,
 * appends it to `document.body`, and manages it for the lifetime of the app.
 */
@Service()
export class KuiToast {
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly toastDefaults = inject(KuiDefaults).get('toast');

  private regionRef: ComponentRef<KuiToastRegion> | null = null;

  /**
   * Programmatically change the toast region position.
   * Useful for interactive demos; prefer `provideKikitaUi({ defaults: { toast } })` for app-level configuration.
   */
  setPosition(position: import('./kui-toast.types').KuiToastPosition): void {
    this.getRegion()?._position.set(position);
  }

  /** Dismiss a toast created by this service. */
  dismiss(id: number): void {
    this.regionRef?.instance.dismiss(id);
  }

  /** Dismiss all toasts created by this service. */
  dismissAll(): void {
    this.regionRef?.instance.dismissAll();
  }

  /**
   * Show a toast notification.
   * Returns a {@link KuiToastRef} handle for programmatic control.
   */
  open(config: KuiToastConfig): KuiToastRef {
    const region = this.getRegion();
    if (!region) {
      return { id: -1, close: noop, update: noop, closed$: EMPTY, action$: EMPTY };
    }

    const options = this.toastDefaults() ?? {};
    const defaultDuration = options.duration ?? 5000;
    const merged: KuiToastConfig = {
      appearance: 'neutral',
      duration: defaultDuration,
      closable: options.closable ?? true,
      showIcon: options.showIcon ?? true,
      showProgress: options.showProgress ?? false,
      ...config,
    };

    return region.addToast(merged, defaultDuration);
  }

  private getRegion(): KuiToastRegion | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    if (!this.regionRef) {
      const options = this.toastDefaults() ?? {};
      this.regionRef = createComponent(KuiToastRegion, {
        environmentInjector: this.environmentInjector,
      });
      const region = this.regionRef.instance;
      let appliedPosition = options.position ?? 'bottom-center';
      let appliedMaxVisible = options.maxVisible ?? 3;
      region._position.set(appliedPosition);
      region._maxVisible.set(appliedMaxVisible);
      // Follow later changes of the defaults. Only a changed default is applied, so a
      // `setPosition()` call made in between is not overwritten by an unchanged default.
      effect(
        () => {
          const next = this.toastDefaults() ?? {};
          const position = next.position ?? 'bottom-center';
          const maxVisible = next.maxVisible ?? 3;
          if (position !== appliedPosition) region._position.set((appliedPosition = position));
          if (maxVisible !== appliedMaxVisible) {
            region._maxVisible.set((appliedMaxVisible = maxVisible));
          }
        },
        { injector: this.environmentInjector },
      );
      this.appRef.attachView(this.regionRef.hostView);
      this.document.body.appendChild(this.regionRef.location.nativeElement);
    }

    return this.regionRef.instance;
  }
}

/**
 * Inject-function for showing toast notifications.
 *
 * Call once during injection context to get a reusable opener function
 * bound to the current injector scope.
 *
 * @example
 * ```ts
 * class MyComponent {
 *   private toast = kuiToast();
 *
 *   save() {
 *     this.api.save().subscribe({
 *       next: () => this.toast.open({ title: 'Saved', appearance: 'success' }),
 *       error: () => this.toast.open({ title: 'Failed', appearance: 'danger', persistent: true }),
 *     });
 *   }
 * }
 * ```
 */
export function kuiToast(): KuiToast {
  return inject(KuiToast);
}
