import { Component } from '@angular/core';

import { KuiLinkDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the four documented inline typography roles on anchor and button hosts. */
@Component({
  selector: 'app-link-typography',
  imports: [KuiLinkDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './link-typography.html',
  styleUrl: './link-typography.scss',
})
export class LinkTypography {
  protected readonly variants = ['body-lg', 'body', 'body-sm', 'caption'] as const;
}
