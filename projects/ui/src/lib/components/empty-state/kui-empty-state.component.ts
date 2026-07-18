import { Component, ViewEncapsulation, input } from '@angular/core';

import { KuiEmptyStateContext } from './kui-empty-state-context.type';
import { KuiEmptyStateSize } from './kui-empty-state-size.type';

/** Displays a non-blocking empty, error, no-access, or success state for known UI regions. */
@Component({
  selector: 'kui-empty-state',
  template: `
    <ng-content select="[kuiEmptyStateIcon]" />
    <div class="kui-empty__body">
      <div class="kui-empty__title">{{ title() }}</div>
      @if (description(); as descriptionText) {
        <div class="kui-empty__description">{{ descriptionText }}</div>
      }
    </div>
    <ng-content select="[kuiEmptyStateActions]" />
  `,
  host: {
    class: 'kui-empty',
    '[attr.data-kui-context]': 'context()',
    '[attr.data-kui-size]': 'size()',
    '[attr.title]': 'null',
  },
  encapsulation: ViewEncapsulation.None,
})
export class KuiEmptyStateComponent {
  /** Empty-state title text. Use the surrounding page hierarchy for heading semantics. */
  readonly title = input.required<string>();

  /** Optional supporting description text. */
  readonly description = input<string | null>(null);

  /** Semantic context that changes the icon accent only. */
  readonly context = input<KuiEmptyStateContext>('no-data');

  /** Empty-state layout size. Small uses a compact horizontal layout. */
  readonly size = input<KuiEmptyStateSize>('md');
}
