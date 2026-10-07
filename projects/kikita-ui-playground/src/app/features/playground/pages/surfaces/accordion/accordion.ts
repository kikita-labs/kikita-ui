import { Component } from '@angular/core';

import { KuiAccordion, KuiAccordionItem, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import {
  AccordionAppearanceMatrix,
  AccordionInteractions,
  AccordionItemStates,
} from './components';

/** Shows Accordion defaults, visual options, state changes, and item composition. */
@Component({
  selector: 'app-accordion',
  imports: [
    AccordionAppearanceMatrix,
    AccordionInteractions,
    AccordionItemStates,
    KuiAccordion,
    KuiAccordionItem,
    KuiText,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './accordion.html',
  styleUrl: './accordion.scss',
})
export class Accordion {}
