import { Component } from '@angular/core';

import {
  KuiAccordion,
  KuiAccordionIcon,
  KuiAccordionItem,
  KuiIcon,
  KuiText,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the disabled item state and optional trigger icon template. */
@Component({
  selector: 'app-accordion-item-states',
  imports: [
    KuiAccordion,
    KuiAccordionIcon,
    KuiAccordionItem,
    KuiIcon,
    KuiText,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './accordion-item-states.html',
  styleUrl: './accordion-item-states.scss',
})
export class AccordionItemStates {}
