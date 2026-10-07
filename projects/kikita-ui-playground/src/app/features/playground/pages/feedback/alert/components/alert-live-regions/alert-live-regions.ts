import { Component, type ElementRef, signal, viewChild } from '@angular/core';

import { KuiAlert, KuiButton } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Inserts polite and assertive Alerts on demand and returns focus to the trigger on close. */
@Component({
  selector: 'app-alert-live-regions',
  imports: [KuiAlert, KuiButton, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './alert-live-regions.html',
  styleUrl: './alert-live-regions.scss',
})
export class AlertLiveRegions {
  protected readonly savedVisible = signal(false);

  protected readonly failedVisible = signal(false);

  private readonly savedTrigger = viewChild.required<ElementRef<HTMLButtonElement>>('savedTrigger');

  private readonly failedTrigger =
    viewChild.required<ElementRef<HTMLButtonElement>>('failedTrigger');

  protected closeSaved(): void {
    this.savedVisible.set(false);
    this.savedTrigger().nativeElement.focus();
  }

  protected closeFailed(): void {
    this.failedVisible.set(false);
    this.failedTrigger().nativeElement.focus();
  }
}
