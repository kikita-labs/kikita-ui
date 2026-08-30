import { Component, signal, ViewEncapsulation } from '@angular/core';

import { KuiButtonDirective, kuiToast } from '@kikita-labs/ui';

import type { KuiToastPosition, KuiToastRef } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-toast-page',
  templateUrl: './toast.page.html',
  styleUrl: './toast.page.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [KuiButtonDirective, PlaygroundPanelComponent],
})
export class ToastPage {
  private readonly toast = kuiToast();

  protected readonly position = signal<KuiToastPosition>('bottom-center');
  protected readonly persistent = signal(true);

  private persistentToast: KuiToastRef | null = null;

  protected readonly positions: KuiToastPosition[] = [
    'top-start',
    'top-center',
    'top-end',
    'bottom-start',
    'bottom-center',
    'bottom-end',
  ];

  protected setPosition(p: KuiToastPosition): void {
    this.position.set(p);
    this.toast.setPosition(p);
  }

  protected openSuccess(): void {
    this.toast.open({
      title: 'File saved',
      message: 'Changes were applied to the project',
      appearance: 'success',
      actionLabel: 'Undo',
      showProgress: true,
    });
  }

  protected openDanger(): void {
    this.toast.open({
      title: 'Could not upload file',
      message: 'Try again.',
      appearance: 'danger',
      persistent: true,
    });
  }

  protected openWarning(): void {
    this.toast.open({
      title: 'Session expires soon',
      message: 'You will be signed out in 2 minutes',
      appearance: 'warning',
      persistent: true,
    });
  }

  protected openInfo(): void {
    this.toast.open({
      title: 'New version available',
      message: 'Sign in again to apply the update',
      appearance: 'info',
      actionLabel: 'Update',
      duration: 8000,
    });
  }

  protected openNeutral(): void {
    this.toast.open({
      title: 'Email deleted',
      actionLabel: 'Undo',
      duration: 6000,
    });
  }

  protected openTitleOnly(): void {
    this.toast.open({ title: 'Settings saved' });
  }

  protected openWithProgress(): void {
    this.toast.open({
      title: 'Deleting in 5 seconds',
      appearance: 'danger',
      showProgress: true,
      duration: 5000,
    });
  }

  protected openPersistent(): void {
    this.persistentToast?.close();
    this.persistent.set(true);
    this.persistentToast = this.toast.open({
      title: 'Background sync is running',
      message: 'The signal controls when auto-dismiss starts.',
      appearance: 'info',
      persistent: this.persistent,
    });
  }

  protected releasePersistent(): void {
    this.persistent.set(false);
  }

  protected updatePersistent(): void {
    this.persistentToast?.update({
      title: 'Background sync complete',
      message: 'The toast now closes automatically in 3 seconds.',
      appearance: 'success',
      persistent: false,
      duration: 3000,
      showProgress: true,
    });
  }

  protected dismissAll(): void {
    this.toast.dismissAll();
    this.persistentToast = null;
  }
}
