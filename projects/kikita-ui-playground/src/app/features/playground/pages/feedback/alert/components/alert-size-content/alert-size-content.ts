import { Component } from '@angular/core';

import { KuiAlertComponent, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the small and medium Alert with title-only, title and message, and action content. */
@Component({
  selector: 'app-alert-size-content',
  imports: [KuiAlertComponent, KuiTextDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './alert-size-content.html',
  styleUrl: './alert-size-content.scss',
})
export class AlertSizeContent {
  protected readonly sizes = [
    { value: 'sm', label: 'alert.sizes.small', group: 'alert.accessibility.small' },
    { value: 'md', label: 'alert.sizes.medium', group: 'alert.accessibility.medium' },
  ] as const;
}
