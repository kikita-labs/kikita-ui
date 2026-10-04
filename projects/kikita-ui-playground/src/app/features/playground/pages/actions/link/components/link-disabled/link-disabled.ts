import { Component, signal } from '@angular/core';

import { KuiLink, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows disabled anchors and buttons, with counters proving their handlers stay silent. */
@Component({
  selector: 'app-link-disabled',
  imports: [KuiLink, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './link-disabled.html',
  styleUrl: './link-disabled.scss',
})
export class LinkDisabled {
  protected readonly anchorHandlerCalls = signal(0);

  protected readonly buttonHandlerCalls = signal(0);

  /** Counts a consumer click handler reaching the disabled anchor. */
  protected countAnchorHandler(): void {
    this.anchorHandlerCalls.update((count) => count + 1);
  }

  /** Counts a consumer click handler reaching the disabled button. */
  protected countButtonHandler(): void {
    this.buttonHandlerCalls.update((count) => count + 1);
  }
}
