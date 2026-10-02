import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import type { ComponentRef } from '@angular/core';
import {
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  inject,
  PLATFORM_ID,
  Service,
} from '@angular/core';

import { EMPTY } from 'rxjs';

import { KuiDefaults } from '../../providers/kui-defaults.service';
import type { KuiToastConfig, KuiToastRef } from './kui-toast.types';
import { KuiToastRegionComponent } from './kui-toast-region.component';

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
export class KuiToastService {
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly toastDefaults = inject(KuiDefaults).get('toast');

  private regionRef: ComponentRef<KuiToastRegionComponent> | null = null;

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
    const merged: KuiToastConfig = {
      appearance: 'neutral',
      duration: options.duration ?? 5000,
      closable: options.closable ?? true,
      showIcon: options.showIcon ?? true,
      showProgress: options.showProgress ?? false,
      ...config,
    };

    return region.addToast(merged);
  }

  private getRegion(): KuiToastRegionComponent | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    if (!this.regionRef) {
      const options = this.toastDefaults() ?? {};
      this.regionRef = createComponent(KuiToastRegionComponent, {
        environmentInjector: this.environmentInjector,
      });
      this.regionRef.instance._position.set(options.position ?? 'bottom-center');
      this.regionRef.instance._maxVisible.set(options.maxVisible ?? 3);
      this.appRef.attachView(this.regionRef.hostView);
      this.document.body.appendChild(this.regionRef.location.nativeElement);
    }

    return this.regionRef.instance;
  }
}
