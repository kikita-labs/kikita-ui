import { Component, DestroyRef, inject, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, type Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import { KuiButtonDirective, kuiDialog } from '@kikita-labs/ui';

import { DialogExampleActions } from '@features/playground/pages/surfaces/dialog/components/dialog-example-actions';
import {
  DialogExampleContent,
  DialogUnnamedContent,
} from '@features/playground/pages/surfaces/dialog/components/dialog-example-content';
import type {
  DialogExampleData,
  DialogExampleResult,
} from '@features/playground/pages/surfaces/dialog/types';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

/** Shows Dialog title and body edge cases plus the independent close and dismiss options. */
@Component({
  selector: 'app-dialog-behavior-examples',
  imports: [DialogExampleActions, KuiButtonDirective, TranslocoPipe],
  templateUrl: './dialog-behavior-examples.html',
  styleUrl: './dialog-behavior-examples.scss',
})
export class DialogBehaviorExamples {
  private readonly destroyRef = inject(DestroyRef);

  private readonly transloco = inject(TranslocoService);

  private readonly openNoClose = kuiDialog(DialogExampleContent, { closable: false });

  private readonly openLocked = kuiDialog(DialogExampleContent, {
    dismissable: false,
    closable: false,
  });

  private readonly openTitleExample = kuiDialog(DialogExampleContent, { size: 'sm' });

  private readonly openLongBody = kuiDialog(DialogExampleContent, { size: 'md' });

  private readonly openUnnamed = kuiDialog(DialogUnnamedContent);

  protected readonly result = signal<string | null>(null);

  protected openNoCloseDialog(): void {
    this.show(this.openNoClose, 'labels.noCloseTitle', 'labels.noCloseBody');
  }

  protected openLockedDialog(): void {
    this.show(this.openLocked, 'labels.lockedTitle', 'labels.lockedBody');
  }

  protected openTitleExampleDialog(): void {
    this.show(this.openTitleExample, 'labels.titleExample', 'labels.titleExampleBody');
  }

  protected openLongBodyDialog(): void {
    this.show(this.openLongBody, 'labels.longBodyTitle', 'labels.longBodyIntro', 18);
  }

  protected openUnnamedDialog(): void {
    this.show(this.openUnnamed, null, 'labels.unnamedBody');
  }

  private show(
    open: (data: DialogExampleData) => Observable<DialogExampleResult | undefined>,
    titleKey: string | null,
    bodyKey: string,
    bodyLineCount = 0,
  ): void {
    this.data(titleKey, bodyKey, bodyLineCount)
      .pipe(
        take(1),
        switchMap((data) => open(data)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => this.showResult(result));
  }

  private data(
    titleKey: string | null,
    bodyKey: string,
    bodyLineCount: number,
  ): Observable<DialogExampleData> {
    const title = titleKey ? this.translate(titleKey) : of(null);
    const bodyLines =
      bodyLineCount > 0
        ? this.translate('labels.longBodyParagraph').pipe(
            map((paragraph) => Array.from({ length: bodyLineCount }, () => paragraph)),
          )
        : of<readonly string[]>([]);

    return combineLatest({
      title,
      body: this.translate(bodyKey),
      bodyLines,
      cancelLabel: this.translate('actions.cancel'),
      confirmLabel: this.translate('actions.continue'),
    }).pipe(
      map(({ title, body, bodyLines, cancelLabel, confirmLabel }) => ({
        title,
        body,
        bodyLines,
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
