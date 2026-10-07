import { Component, input } from '@angular/core';

import {
  KuiProgress,
  type KuiProgressColor,
  type KuiProgressSize,
  type KuiProgressType,
  KuiText,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Compares every Progress color and size for one visual shape. */
@Component({
  selector: 'app-progress-variant-matrix',
  imports: [KuiProgress, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './progress-variant-matrix.html',
  styleUrl: './progress-variant-matrix.scss',
})
export class ProgressVariantMatrix {
  readonly type = input.required<KuiProgressType>();

  protected readonly sizes: readonly KuiProgressSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

  protected readonly colors: readonly KuiProgressColor[] = [
    'primary',
    'success',
    'warning',
    'danger',
    'neutral',
  ];
}
