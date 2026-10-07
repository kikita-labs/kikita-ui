import type { OnDestroy } from '@angular/core';
import { Component } from '@angular/core';

import { KuiText, kuiToast } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import { ToastLifecycle, ToastNotifications, ToastPositions } from './components';

/** Shows Toast defaults, supported appearances, positions, and lifecycle behavior. */
@Component({
  selector: 'app-toast',
  imports: [KuiText, ToastLifecycle, ToastNotifications, ToastPositions, TranslocoPipe],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast implements OnDestroy {
  private readonly toast = kuiToast();

  ngOnDestroy(): void {
    this.toast.dismissAll();
  }
}
