import { Component } from '@angular/core';

import {
  KuiButton,
  KuiEmptyState,
  KuiEmptyStateActions,
  KuiEmptyStateIcon,
  KuiText,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { EmptyStateContentCompositions, EmptyStateLiveFilter } from './components';

/** Shows the documented Empty State contexts, sizes, slots, and dynamic status behavior. */
@Component({
  selector: 'app-empty-state',
  imports: [
    KuiButton,
    KuiEmptyStateActions,
    KuiEmptyState,
    KuiEmptyStateIcon,
    KuiText,
    EmptyStateContentCompositions,
    EmptyStateLiveFilter,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
})
export class EmptyState {
  protected readonly contexts = [
    {
      value: 'no-data',
      label: 'emptyState.contexts.noData',
      heading: 'emptyState.samples.noData.heading',
      description: 'emptyState.samples.noData.description',
    },
    {
      value: 'no-results',
      label: 'emptyState.contexts.noResults',
      heading: 'emptyState.samples.noResults.heading',
      description: 'emptyState.samples.noResults.description',
    },
    {
      value: 'error',
      label: 'emptyState.contexts.error',
      heading: 'emptyState.samples.error.heading',
      description: 'emptyState.samples.error.description',
    },
    {
      value: 'no-access',
      label: 'emptyState.contexts.noAccess',
      heading: 'emptyState.samples.noAccess.heading',
      description: 'emptyState.samples.noAccess.description',
    },
    {
      value: 'success',
      label: 'emptyState.contexts.success',
      heading: 'emptyState.samples.success.heading',
      description: 'emptyState.samples.success.description',
    },
  ] as const;

  protected readonly sizes = [
    { value: 'sm', label: 'emptyState.sizes.small' },
    { value: 'md', label: 'emptyState.sizes.medium' },
    { value: 'lg', label: 'emptyState.sizes.large' },
  ] as const;
}
