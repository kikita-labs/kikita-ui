import { Component } from '@angular/core';

import { KuiAvatar, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-avatar-variant-examples',
  imports: [KuiAvatar, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './avatar-variant-examples.html',
  styleUrl: './avatar-variant-examples.scss',
})
export class AvatarVariantExamples {
  protected readonly sizes = [
    { value: 'xs', label: 'extraSmall' },
    { value: 'sm', label: 'small' },
    { value: 'md', label: 'medium' },
    { value: 'lg', label: 'large' },
    { value: 'xl', label: 'extraLarge' },
    { value: '2xl', label: 'twoExtraLarge' },
  ] as const;

  protected readonly shapes = [
    { value: 'circle', label: 'circle' },
    { value: 'square', label: 'square' },
  ] as const;

  protected readonly paletteSlots = [1, 2, 3, 4, 5, 6, 7] as const;
}
