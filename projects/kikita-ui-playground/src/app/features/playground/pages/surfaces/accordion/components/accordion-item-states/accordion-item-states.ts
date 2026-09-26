import { Component } from '@angular/core';

import {
  KuiAccordionComponent,
  KuiAccordionIconDirective,
  KuiAccordionItemComponent,
  KuiIconComponent,
  KuiTextDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the disabled item state and optional trigger icon template. */
@Component({
  selector: 'app-accordion-item-states',
  imports: [
    KuiAccordionComponent,
    KuiAccordionIconDirective,
    KuiAccordionItemComponent,
    KuiIconComponent,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './accordion-item-states.html',
  styleUrl: './accordion-item-states.scss',
})
export class AccordionItemStates {}
