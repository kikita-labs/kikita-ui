import type { OnDestroy } from '@angular/core';
import { Component, DestroyRef, inject, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { KuiButtonDirective, kuiToast } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import type { KuiToastPosition, KuiToastRef } from '@kikita-labs/ui';

@Component({
  selector: 'app-toast-positions',
  imports: [KuiButtonDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './toast-positions.html',
  styleUrl: './toast-positions.scss',
})
export class ToastPositions implements OnDestroy {
  private readonly toast = kuiToast();
  private readonly transloco = inject(TranslocoService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly position = signal<KuiToastPosition>('bottom-center');
  protected readonly positions: readonly { value: KuiToastPosition; label: string }[] = [
    { value: 'top-start', label: 'toast.positions.topStart' },
    { value: 'top-center', label: 'toast.positions.topCenter' },
    { value: 'top-end', label: 'toast.positions.topEnd' },
    { value: 'bottom-start', label: 'toast.positions.bottomStart' },
    { value: 'bottom-center', label: 'toast.positions.bottomCenter' },
    { value: 'bottom-end', label: 'toast.positions.bottomEnd' },
  ];

  private positionRef: KuiToastRef | null = null;

  ngOnDestroy(): void {
    if (this.position() !== 'bottom-center') {
      this.toast.setPosition('bottom-center');
    }
  }

  protected showAt(value: KuiToastPosition, label: string): void {
    this.position.set(value);
    this.toast.setPosition(value);

    const toastConfig = {
      title: this.transloco.translate('toast.labels.positionTitle'),
      message: this.transloco.translate('toast.labels.positionMessage', {
        position: this.transloco.translate(label),
      }),
      appearance: 'info' as const,
      persistent: true,
    };

    if (this.positionRef) {
      this.positionRef.update(toastConfig);
      return;
    }

    const ref = this.toast.open(toastConfig);
    this.positionRef = ref;
    ref.closed$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.positionRef?.id === ref.id) this.positionRef = null;
    });
  }
}
