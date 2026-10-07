import { Component } from '@angular/core';

import { KuiAlert, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows every Alert appearance in every shape with a title, message, icon, and close button. */
@Component({
  selector: 'app-alert-appearance-matrix',
  imports: [KuiAlert, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './alert-appearance-matrix.html',
  styleUrl: './alert-appearance-matrix.scss',
})
export class AlertAppearanceMatrix {
  protected readonly shapes = [
    { value: 'soft', label: 'alert.shapes.soft', group: 'alert.accessibility.soft' },
    { value: 'outline', label: 'alert.shapes.outline', group: 'alert.accessibility.outline' },
    { value: 'solid', label: 'alert.shapes.solid', group: 'alert.accessibility.solid' },
  ] as const;

  protected readonly appearances = [
    { value: 'neutral', label: 'alert.appearances.neutral' },
    { value: 'info', label: 'alert.appearances.info' },
    { value: 'success', label: 'alert.appearances.success' },
    { value: 'warning', label: 'alert.appearances.warning' },
    { value: 'danger', label: 'alert.appearances.danger' },
  ] as const;
}
