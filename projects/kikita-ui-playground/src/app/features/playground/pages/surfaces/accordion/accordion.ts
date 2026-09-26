import { Component } from '@angular/core';

import {
  KuiAccordionComponent,
  KuiAccordionItemComponent,
  KuiTextDirective,
} from '@kikita-labs/ui';

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
    KuiAccordionComponent,
    KuiAccordionItemComponent,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './accordion.html',
  styleUrl: './accordion.scss',
})
export class Accordion {}
