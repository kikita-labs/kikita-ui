import { Component, signal } from '@angular/core';

import { KuiAccordion, KuiAccordionItem, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows exclusive and multi item toggling with two-way model state. */
@Component({
  selector: 'app-accordion-interactions',
  imports: [KuiAccordion, KuiAccordionItem, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './accordion-interactions.html',
  styleUrl: './accordion-interactions.scss',
})
export class AccordionInteractions {
  protected readonly exclusiveExpandedItems = signal<string[]>([]);
  protected readonly multiExpandedItems = signal<string[]>([]);
}
