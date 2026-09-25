import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows native scrolling with Kikita UI's local and application-wide scrollbar styling. */
@Component({
  selector: 'app-scrollbar',
  imports: [KuiTextDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './scrollbar.html',
  styleUrl: './scrollbar.scss',
})
export class Scrollbar {
  protected readonly rows = Array.from({ length: 14 }, (_, index) => index + 1);
  protected readonly tableRows = Array.from({ length: 8 }, (_, index) => index + 1);
  protected readonly columns = Array.from({ length: 8 }, (_, index) => index + 1);
  protected readonly themeRows = Array.from({ length: 6 }, (_, index) => index + 1);
}
