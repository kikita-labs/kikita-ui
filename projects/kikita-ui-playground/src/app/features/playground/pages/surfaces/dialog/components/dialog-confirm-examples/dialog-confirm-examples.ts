import { Component, DestroyRef, inject, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, type Observable, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

import { KuiButtonDirective, kuiConfirm, type KuiConfirmConfig } from '@kikita-labs/ui';

import { DialogExampleActions } from '@features/playground/pages/surfaces/dialog/components/dialog-example-actions';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

/** Shows the prebuilt confirmation dialog's default, danger, and warning intents. */
@Component({
  selector: 'app-dialog-confirm-examples',
  imports: [DialogExampleActions, KuiButtonDirective, TranslocoPipe],
  templateUrl: './dialog-confirm-examples.html',
  styleUrl: './dialog-confirm-examples.scss',
})
export class DialogConfirmExamples {
  private readonly destroyRef = inject(DestroyRef);

  private readonly transloco = inject(TranslocoService);

  private readonly confirm = kuiConfirm();

  protected readonly result = signal<string | null>(null);

  protected openDefault(): void {
    this.show('labels.confirmTitle', 'labels.confirmBody', undefined, 'actions.continue');
  }

  protected openDanger(): void {
    this.show('labels.dangerConfirmTitle', 'labels.dangerConfirmBody', 'danger', 'actions.delete');
  }

  protected openWarning(): void {
    this.show(
      'labels.warningConfirmTitle',
      'labels.warningConfirmBody',
      'warning',
      'actions.reset',
    );
  }

  protected openWithoutMessage(): void {
    this.show('labels.headerOnlyTitle', null, undefined, 'actions.continue');
  }

  private show(
    titleKey: string,
    messageKey: string | null,
    appearance: KuiConfirmConfig['appearance'],
    confirmLabelKey: string,
  ): void {
    combineLatest({
      title: this.translate(titleKey),
      message: messageKey ? this.translate(messageKey) : of(undefined),
      confirmLabel: this.translate(confirmLabelKey),
      cancelLabel: this.translate('actions.cancel'),
    })
      .pipe(
        take(1),
        switchMap(({ title, message, confirmLabel, cancelLabel }) => {
          const config: KuiConfirmConfig = {
            title,
            confirmLabel,
            cancelLabel,
            ...(message ? { message } : {}),
            ...(appearance ? { appearance } : {}),
          };

          return this.confirm(config);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((confirmed) => {
        const statusKey = `status.confirm.${confirmed ? 'yes' : 'no'}`;

        this.translate(statusKey)
          .pipe(take(1), takeUntilDestroyed(this.destroyRef))
          .subscribe((message) => this.result.set(message));
      });
  }

  private translate(key: string): Observable<string> {
    return this.transloco.selectTranslate(key, {}, { scope: 'dialog' });
  }
}
