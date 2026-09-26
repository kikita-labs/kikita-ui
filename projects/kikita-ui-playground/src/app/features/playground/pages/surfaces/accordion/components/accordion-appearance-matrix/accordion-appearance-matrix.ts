import { Component } from '@angular/core';

import {
  KuiAccordionComponent,
  KuiAccordionItemComponent,
  KuiTextDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { ACCORDION_APPEARANCES, ACCORDION_SIZES } from '../../constants';

/** Renders every supported Accordion appearance and size combination. */
@Component({
  selector: 'app-accordion-appearance-matrix',
  imports: [
    KuiAccordionComponent,
    KuiAccordionItemComponent,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './accordion-appearance-matrix.html',
  styleUrl: './accordion-appearance-matrix.scss',
})
export class AccordionAppearanceMatrix {
  protected readonly appearances = ACCORDION_APPEARANCES;
  protected readonly sizes = ACCORDION_SIZES;
}
