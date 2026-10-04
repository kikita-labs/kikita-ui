import { Component, DestroyRef, inject, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, type Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import { KuiButton, kuiDialog } from '@kikita-labs/ui';

import { DialogExampleActions } from '@features/playground/pages/surfaces/dialog/components/dialog-example-actions';
import { DialogExampleContent } from '@features/playground/pages/surfaces/dialog/components/dialog-example-content';
import type {
  DialogExampleData,
  DialogExampleResult,
} from '@features/playground/pages/surfaces/dialog/types';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

/** Shows every Dialog appearance with its optional icon. */
@Component({
  selector: 'app-dialog-appearance-examples',
  imports: [DialogExampleActions, KuiButton, TranslocoPipe],
  templateUrl: './dialog-appearance-examples.html',
  styleUrl: './dialog-appearance-examples.scss',
})
export class DialogAppearanceExamples {
  private readonly destroyRef = inject(DestroyRef);

  private readonly transloco = inject(TranslocoService);

  private readonly openDefault = kuiDialog(DialogExampleContent, { appearance: 'default' });

  private readonly openDanger = kuiDialog(DialogExampleContent, { appearance: 'danger' });

  private readonly openWarning = kuiDialog(DialogExampleContent, { appearance: 'warning' });

  protected readonly result = signal<string | null>(null);

  protected openDefaultDialog(): void {
    this.show(this.openDefault, 'labels.defaultAppearanceTitle');
  }

  protected openDangerDialog(): void {
    this.show(this.openDanger, 'labels.dangerAppearanceTitle');
  }

  protected openWarningDialog(): void {
    this.show(this.openWarning, 'labels.warningAppearanceTitle');
  }

  private show(
    open: (data: DialogExampleData) => Observable<DialogExampleResult | undefined>,
    titleKey: string,
  ): void {
    combineLatest({
      title: this.translate(titleKey),
      body: this.translate('labels.appearanceBody'),
      cancelLabel: this.translate('actions.cancel'),
      confirmLabel: this.translate('actions.continue'),
    })
      .pipe(
        take(1),
        map(
          ({ title, body, cancelLabel, confirmLabel }): DialogExampleData => ({
            title,
            body,
            bodyLines: [],
            showIcon: true,
            cancelLabel,
            confirmLabel,
          }),
        ),
        switchMap((data) => open(data)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        const key =
          result === 'saved' ? 'saved' : result === 'cancelled' ? 'cancelled' : 'dismissed';
        this.showResult(key);
      });
  }

  private translate(key: string): Observable<string> {
    return this.transloco.selectTranslate(key, {}, { scope: 'dialog' });
  }

  private showResult(key: string): void {
    this.translate(`status.${key}`)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((message) => this.result.set(message));
  }
}
