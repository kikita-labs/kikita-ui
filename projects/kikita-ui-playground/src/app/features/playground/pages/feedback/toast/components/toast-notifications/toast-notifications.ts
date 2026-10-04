import { Component, DestroyRef, inject, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { KuiButton, KuiText, kuiToast } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import type { KuiToastAppearance, KuiToastRef } from '@kikita-labs/ui';

@Component({
  selector: 'app-toast-notifications',
  imports: [KuiButton, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './toast-notifications.html',
  styleUrl: './toast-notifications.scss',
})
export class ToastNotifications {
  private readonly toast = kuiToast();
  private readonly transloco = inject(TranslocoService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly appearances: readonly {
    value: Exclude<KuiToastAppearance, 'neutral'>;
    label: string;
    title: string;
  }[] = [
    {
      value: 'success',
      label: 'toast.appearances.success',
      title: 'toast.labels.successTitle',
    },
    {
      value: 'warning',
      label: 'toast.appearances.warning',
      title: 'toast.labels.warningTitle',
    },
    {
      value: 'danger',
      label: 'toast.appearances.danger',
      title: 'toast.labels.dangerTitle',
    },
    {
      value: 'info',
      label: 'toast.appearances.info',
      title: 'toast.labels.infoTitle',
    },
  ];

  protected readonly actionResult = signal('');
  protected readonly closedResult = signal('');
  private nonClosableRef: KuiToastRef | null = null;

  protected showDefault(): void {
    this.toast.open({ title: this.transloco.translate('toast.labels.defaultTitle') });
  }

  protected showAppearance(appearance: (typeof this.appearances)[number]): void {
    this.toast.open({
      title: this.transloco.translate(appearance.title),
      message: this.transloco.translate('toast.labels.appearanceMessage'),
      appearance: appearance.value,
      persistent: true,
    });
  }

  protected showMessage(): void {
    this.toast.open({
      title: this.transloco.translate('toast.labels.messageTitle'),
      message: this.transloco.translate('toast.labels.longMessage'),
      appearance: 'info',
      persistent: true,
    });
  }

  protected showAction(): void {
    this.actionResult.set('');
    const ref = this.toast.open({
      title: this.transloco.translate('toast.labels.actionTitle'),
      message: this.transloco.translate('toast.labels.actionMessage'),
      actionLabel: this.transloco.translate('toast.actions.undo'),
      persistent: true,
    });

    ref.action$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.actionResult.set(this.transloco.translate('toast.labels.actionReceived'));
    });
  }

  protected showWithoutIcon(): void {
    this.toast.open({
      title: this.transloco.translate('toast.labels.noIconTitle'),
      appearance: 'success',
      showIcon: false,
      persistent: true,
    });
  }

  protected showWithoutClose(): void {
    this.closedResult.set('');
    this.nonClosableRef = this.toast.open({
      title: this.transloco.translate('toast.labels.noCloseTitle'),
      message: this.transloco.translate('toast.labels.noCloseMessage'),
      appearance: 'warning',
      closable: false,
      persistent: true,
    });
    this.nonClosableRef.closed$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.closedResult.set(this.transloco.translate('toast.labels.closedByRef'));
      this.nonClosableRef = null;
    });
  }

  protected closeWithoutButton(): void {
    this.nonClosableRef?.close();
  }

  protected showProgress(): void {
    this.toast.open({
      title: this.transloco.translate('toast.labels.progressTitle'),
      message: this.transloco.translate('toast.labels.progressMessage'),
      appearance: 'info',
      duration: 60_000,
      showProgress: true,
    });
  }
}
