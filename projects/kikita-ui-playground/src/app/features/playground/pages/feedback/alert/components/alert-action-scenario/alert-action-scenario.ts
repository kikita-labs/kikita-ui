import { Component, signal } from '@angular/core';

import { KuiAlert, KuiAlertActions, KuiButton, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the action output and projected actions, which replace the action button and its output. */
@Component({
  selector: 'app-alert-action-scenario',
  imports: [KuiAlertActions, KuiAlert, KuiButton, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './alert-action-scenario.html',
  styleUrl: './alert-action-scenario.scss',
})
export class AlertActionScenario {
  protected readonly renewClicks = signal(0);

  protected readonly lastAction = signal<'none' | 'retry' | 'discard'>('none');

  protected renew(): void {
    this.renewClicks.update((count) => count + 1);
  }

  protected choose(action: 'retry' | 'discard'): void {
    this.lastAction.set(action);
  }
}
