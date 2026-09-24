import { Component } from '@angular/core';

import { KuiIconComponent, type KuiIconSizePreset, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Compares all named Icon sizes with numeric and CSS-string values. */
@Component({
  selector: 'app-icon-size-examples',
  imports: [KuiIconComponent, KuiTextDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './icon-size-examples.html',
  styleUrl: './icon-size-examples.scss',
})
export class IconSizeExamples {
  protected readonly presetSizes = [
    '2xs',
    'xs',
    'sm',
    'md',
    'lg',
    'xl',
    '2xl',
  ] satisfies readonly KuiIconSizePreset[];

  protected readonly customSizes = [
    {
      id: 'numeric',
      value: 24,
      label: 'icon.labels.numericSize',
      accessibility: 'icon.accessibility.numericSize',
    },
    {
      id: 'css',
      value: '1.75em',
      label: 'icon.labels.cssSize',
      accessibility: 'icon.accessibility.cssSize',
    },
  ] as const;
}
