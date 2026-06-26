import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  PLATFORM_ID,
  Service,
  createComponent,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EMPTY } from 'rxjs';

import { KuiToastRegionComponent } from './kui-toast-region.component';
import { KUI_TOAST_OPTIONS } from './kui-toast.token';
import type { KuiToastConfig, KuiToastOptions, KuiToastRef } from './kui-toast.types';

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
  private readonly options: KuiToastOptions =
    inject(KUI_TOAST_OPTIONS, { optional: true }) ?? {};

  private regionRef: ComponentRef<KuiToastRegionComponent> | null = null;

  /**
   * Programmatically change the toast region position.
   * Useful for interactive demos; prefer `provideKuiToastOptions` for app-level configuration.
   */
  setPosition(position: import('./kui-toast.types').KuiToastPosition): void {
    this.getRegion()?._position.set(position);
  }

  /**
   * Show a toast notification.
   * Returns a {@link KuiToastRef} handle for programmatic control.
   */
  open(config: KuiToastConfig): KuiToastRef {
    const region = this.getRegion();
    if (!region) {
      return { close: () => {}, closed$: EMPTY, action$: EMPTY };
    }

    const merged: KuiToastConfig = {
      appearance: 'neutral',
      duration: this.options.duration ?? 5000,
      closable: this.options.closable ?? true,
      showIcon: this.options.showIcon ?? true,
      showProgress: this.options.showProgress ?? false,
      ...config,
    };

    return region.addToast(merged);
  }

  private getRegion(): KuiToastRegionComponent | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    if (!this.regionRef) {
      this.regionRef = createComponent(KuiToastRegionComponent, {
        environmentInjector: this.environmentInjector,
      });
      this.regionRef.instance._position.set(this.options.position ?? 'bottom-center');
      this.regionRef.instance._maxVisible.set(this.options.maxVisible ?? 3);
      this.appRef.attachView(this.regionRef.hostView);
      document.body.appendChild(this.regionRef.location.nativeElement);
    }

    return this.regionRef.instance;
  }
}
