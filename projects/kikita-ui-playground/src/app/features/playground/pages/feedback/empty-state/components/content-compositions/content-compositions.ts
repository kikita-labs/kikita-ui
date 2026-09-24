import { Component } from '@angular/core';

import {
  KuiButtonDirective,
  KuiEmptyStateActionsDirective,
  KuiEmptyStateComponent,
  KuiTextDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows heading-only, description-only, and action-only Empty State compositions. */
@Component({
  selector: 'app-empty-state-content-compositions',
  imports: [
    KuiButtonDirective,
    KuiEmptyStateActionsDirective,
    KuiEmptyStateComponent,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './content-compositions.html',
  styleUrl: './content-compositions.scss',
})
export class EmptyStateContentCompositions {}
