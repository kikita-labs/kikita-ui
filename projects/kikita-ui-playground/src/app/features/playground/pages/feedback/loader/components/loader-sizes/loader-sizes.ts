import { Component } from '@angular/core';

import { KuiLoaderDirective, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows every supported Loader size with its resolved size attribute. */
@Component({
  selector: 'app-loader-sizes',
  imports: [KuiLoaderDirective, KuiTextDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './loader-sizes.html',
  styleUrl: './loader-sizes.scss',
})
export class LoaderSizes {
  protected readonly sizes = [
    {
      value: 'xs',
      label: 'loader.sizes.extraSmall',
      accessibleName: 'loader.accessibility.extraSmall',
    },
    { value: 'sm', label: 'loader.sizes.small', accessibleName: 'loader.accessibility.small' },
    {
      value: 'md',
      label: 'loader.sizes.medium',
      accessibleName: 'loader.accessibility.medium',
    },
    { value: 'lg', label: 'loader.sizes.large', accessibleName: 'loader.accessibility.large' },
  ] as const;
}
