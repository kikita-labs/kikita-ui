import { Component } from '@angular/core';

import { KuiSeparatorDirective, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows Separator's supported appearance, spacing, and orientation values. */
@Component({
  selector: 'app-separator',
  imports: [KuiSeparatorDirective, KuiTextDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './separator.html',
  styleUrl: './separator.scss',
})
export class Separator {
  protected readonly appearances = [
    { key: 'subtle', value: 'subtle' },
    { key: 'default', value: 'default' },
    { key: 'strong', value: 'strong' },
  ] as const;

  protected readonly spacings = [
    { key: 'none', value: 'none' },
    { key: 'extraSmall', value: 'xs' },
    { key: 'small', value: 'sm' },
    { key: 'medium', value: 'md' },
    { key: 'large', value: 'lg' },
  ] as const;
}
