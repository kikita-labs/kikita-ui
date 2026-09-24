import { Component, signal } from '@angular/core';

import { KuiButtonDirective, KuiIconButtonDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows disabled, loading, and interactive icon button states. */
@Component({
  selector: 'app-icon-button-states',
  imports: [KuiButtonDirective, KuiIconButtonDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './icon-button-states.html',
  styleUrl: './icon-button-states.scss',
})
export class IconButtonStates {
  protected readonly interactiveLoading = signal(false);

  /** Toggles the live loading example between its normal and loading states. */
  protected toggleInteractiveLoading(): void {
    this.interactiveLoading.update((loading) => !loading);
  }
}
