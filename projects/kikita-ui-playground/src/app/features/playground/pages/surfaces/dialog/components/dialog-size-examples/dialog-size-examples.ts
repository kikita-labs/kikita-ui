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

/** Shows the default Dialog size and every supported width preset. */
@Component({
  selector: 'app-dialog-size-examples',
  imports: [DialogExampleActions, KuiButton, TranslocoPipe],
  templateUrl: './dialog-size-examples.html',
  styleUrl: './dialog-size-examples.scss',
})
export class DialogSizeExamples {
  private readonly destroyRef = inject(DestroyRef);

  private readonly transloco = inject(TranslocoService);

  private readonly openDefault = kuiDialog(DialogExampleContent);

  private readonly openAuto = kuiDialog(DialogExampleContent, { size: 'auto' });

  private readonly openSm = kuiDialog(DialogExampleContent, { size: 'sm' });

  private readonly openMd = kuiDialog(DialogExampleContent, { size: 'md' });

  private readonly openLg = kuiDialog(DialogExampleContent, { size: 'lg' });

  private readonly openFullscreen = kuiDialog(DialogExampleContent, { size: 'fullscreen' });

  protected readonly result = signal<string | null>(null);

  protected openDefaultDialog(): void {
    this.show(this.openDefault, 'labels.defaultTitle', 'labels.defaultBody');
  }

  protected openAutoDialog(): void {
    this.show(this.openAuto, 'labels.autoTitle', 'labels.sizeBody');
  }

  protected openSmDialog(): void {
    this.show(this.openSm, 'labels.smTitle', 'labels.sizeBody');
  }

  protected openMdDialog(): void {
    this.show(this.openMd, 'labels.mdTitle', 'labels.sizeBody');
  }

  protected openLgDialog(): void {
    this.show(this.openLg, 'labels.lgTitle', 'labels.sizeBody');
  }

  protected openFullscreenDialog(): void {
    this.show(this.openFullscreen, 'labels.fullscreenTitle', 'labels.fullscreenBody');
  }

  private show(
    open: (data: DialogExampleData) => Observable<DialogExampleResult | undefined>,
    titleKey: string,
    bodyKey: string,
  ): void {
    this.data(titleKey, bodyKey)
      .pipe(
        take(1),
        switchMap((data) => open(data)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => this.showResult(result));
  }

  private data(titleKey: string, bodyKey: string): Observable<DialogExampleData> {
    return combineLatest({
      title: this.translate(titleKey),
      body: this.translate(bodyKey),
      cancelLabel: this.translate('actions.cancel'),
      confirmLabel: this.translate('actions.continue'),
    }).pipe(
      map(({ title, body, cancelLabel, confirmLabel }) => ({
        title,
        body,
        bodyLines: [],
        showIcon: false,
        cancelLabel,
        confirmLabel,
      })),
    );
  }

  private translate(key: string): Observable<string> {
    return this.transloco.selectTranslate(key, {}, { scope: 'dialog' });
  }

  private showResult(result: DialogExampleResult | undefined): void {
    const key = result === 'saved' ? 'saved' : result === 'cancelled' ? 'cancelled' : 'dismissed';

    this.translate(`status.${key}`)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((message) => this.result.set(message));
  }
}
