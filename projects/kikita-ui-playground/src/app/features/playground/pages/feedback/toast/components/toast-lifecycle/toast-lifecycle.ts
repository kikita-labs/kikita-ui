import { Component, DestroyRef, inject, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { KuiButton, KuiText, kuiToast } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import type { KuiToastRef } from '@kikita-labs/ui';

@Component({
  selector: 'app-toast-lifecycle',
  imports: [KuiButton, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './toast-lifecycle.html',
  styleUrl: './toast-lifecycle.scss',
})
export class ToastLifecycle {
  private readonly toast = kuiToast();
  private readonly transloco = inject(TranslocoService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly persistent = signal(true);
  protected readonly hasTrackedToast = signal(false);
  protected readonly lifecycleResult = signal('');
  protected readonly stackTitles = [
    'toast.labels.stackFirst',
    'toast.labels.stackSecond',
    'toast.labels.stackThird',
    'toast.labels.stackFourth',
  ] as const;

  private trackedRef: KuiToastRef | null = null;

  protected openTracked(): void {
    this.lifecycleResult.set('');
    this.persistent.set(true);
    const ref = this.toast.open({
      title: this.transloco.translate('toast.labels.syncTitle'),
      message: this.transloco.translate('toast.labels.syncMessage'),
      appearance: 'info',
      persistent: this.persistent,
      showProgress: true,
      duration: 8_000,
    });

    this.trackedRef = ref;
    this.hasTrackedToast.set(true);
    ref.closed$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.hasTrackedToast.set(false);
      this.trackedRef = null;
      this.lifecycleResult.set(this.transloco.translate('toast.labels.closedByRef'));
    });
  }

  protected releasePersistence(): void {
    this.persistent.set(false);
  }

  protected updateTracked(): void {
    this.trackedRef?.update({
      title: this.transloco.translate('toast.labels.updatedTitle'),
      message: this.transloco.translate('toast.labels.updatedMessage'),
      appearance: 'success',
      persistent: false,
      duration: 30_000,
      showProgress: true,
    });
  }

  protected closeTracked(): void {
    this.trackedRef?.close();
  }

  protected dismissTrackedById(): void {
    if (this.trackedRef) {
      this.toast.dismiss(this.trackedRef.id);
    }
  }

  protected openStack(): void {
    this.lifecycleResult.set('');
    for (const title of this.stackTitles) {
      this.toast.open({
        title: this.transloco.translate(title),
        appearance: 'neutral',
        duration: Infinity,
      });
    }
  }

  protected dismissAll(): void {
    this.toast.dismissAll();
    this.hasTrackedToast.set(false);
    this.trackedRef = null;
  }
}
