import { Component } from '@angular/core';

import { KuiButton, KuiPopover, KuiPopoverFor, KuiText } from '@kikita-labs/ui';

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
    KuiButton,
    KuiPopover,
    KuiPopoverFor,
    KuiText,
    TranslocoPipe,
  ],
  templateUrl: './popover.html',
  styleUrl: './popover.scss',
})
export class Popover {}
