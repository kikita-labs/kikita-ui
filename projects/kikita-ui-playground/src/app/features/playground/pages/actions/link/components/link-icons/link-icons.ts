import { Component } from '@angular/core';

import { KuiLink } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the start and end icon slots on anchor and button hosts. */
@Component({
  selector: 'app-link-icons',
  imports: [KuiLink, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './link-icons.html',
  styleUrl: './link-icons.scss',
})
export class LinkIcons {}
