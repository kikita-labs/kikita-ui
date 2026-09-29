import { Component } from '@angular/core';

import { KuiLinkDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows automatic, explicit, customized, and opted-out external link handling. */
@Component({
  selector: 'app-link-external',
  imports: [KuiLinkDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './link-external.html',
  styleUrl: './link-external.scss',
})
export class LinkExternal {}
