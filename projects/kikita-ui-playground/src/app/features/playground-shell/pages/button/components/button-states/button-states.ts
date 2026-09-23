import { Component, signal } from '@angular/core';

import { KuiButtonDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground-shell/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-button-states',
  imports: [KuiButtonDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './button-states.html',
  styleUrl: './button-states.scss',
})
export class ButtonStates {
  protected readonly interactiveLoading = signal(false);

  /** Toggles the live loading example between its normal and loading states. */
  protected toggleInteractiveLoading(): void {
    this.interactiveLoading.update((loading) => !loading);
  }
}
