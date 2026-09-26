import { Component } from '@angular/core';

import {
  KuiButtonDirective,
  KuiPopoverComponent,
  KuiPopoverForDirective,
  KuiTextDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { PopoverContentExamples, PopoverFormExamples, PopoverPositionExamples } from './components';

/** Shows Popover positions, projected content, trigger modes, and dismissal behavior. */
@Component({
  selector: 'app-popover',
  imports: [
    PlaygroundExampleCard,
    PopoverContentExamples,
    PopoverFormExamples,
    PopoverPositionExamples,
    KuiButtonDirective,
    KuiPopoverComponent,
    KuiPopoverForDirective,
    KuiTextDirective,
    TranslocoPipe,
  ],
  templateUrl: './popover.html',
  styleUrl: './popover.scss',
})
export class Popover {}
