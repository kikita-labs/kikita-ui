import { Component, signal, ViewEncapsulation } from '@angular/core';

import {
  KuiAccordionComponent,
  KuiAccordionItemComponent,
  KuiButtonDirective,
  KuiFieldComponent,
  KuiInputDirective,
} from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-accordion-page',
  templateUrl: './accordion.page.html',
  styleUrl: './accordion.page.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    KuiAccordionComponent,
    KuiAccordionItemComponent,
    KuiButtonDirective,
    KuiFieldComponent,
    KuiInputDirective,
    PlaygroundPanelComponent,
  ],
})
export class AccordionPage {
  protected readonly exclusiveExpanded = signal<string[]>([]);
  protected readonly multiExpanded = signal<string[]>(['m0', 'm2']);
  protected readonly contentExpanded = signal<string[]>([]);
}
