import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows native host elements and the directive next to plain CSS classes. */
@Component({
  selector: 'app-typography-hosts',
  imports: [KuiTextDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './typography-hosts.html',
  styleUrl: './typography-hosts.scss',
})
export class TypographyHosts {}
