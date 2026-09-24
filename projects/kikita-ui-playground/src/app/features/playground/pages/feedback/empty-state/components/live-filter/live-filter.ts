import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  KuiButtonDirective,
  KuiEmptyStateActionsDirective,
  KuiEmptyStateComponent,
  KuiEmptyStateIconDirective,
  KuiInputDirective,
  KuiTextDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the dynamic no-results state and restores matching projects through a projected action. */
@Component({
  selector: 'app-empty-state-live-filter',
  imports: [
    FormsModule,
    KuiButtonDirective,
    KuiEmptyStateActionsDirective,
    KuiEmptyStateComponent,
    KuiEmptyStateIconDirective,
    KuiInputDirective,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './live-filter.html',
  styleUrl: './live-filter.scss',
})
export class EmptyStateLiveFilter {
  protected readonly projects = ['Atlas', 'Birch', 'Cobalt'] as const;
  protected readonly filterQuery = signal('');
  protected readonly filteredProjects = computed(() => {
    const query = this.filterQuery().trim().toLowerCase();

    return query
      ? this.projects.filter((project) => project.toLowerCase().includes(query))
      : this.projects;
  });

  protected clearFilter(): void {
    this.filterQuery.set('');
  }
}
