import { Component } from '@angular/core';

import { KuiButton, KuiEmptyState, KuiEmptyStateActions, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows heading-only, description-only, and action-only Empty State compositions. */
@Component({
  selector: 'app-empty-state-content-compositions',
  imports: [
    KuiButton,
    KuiEmptyStateActions,
    KuiEmptyState,
    KuiText,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './content-compositions.html',
  styleUrl: './content-compositions.scss',
})
export class EmptyStateContentCompositions {}
