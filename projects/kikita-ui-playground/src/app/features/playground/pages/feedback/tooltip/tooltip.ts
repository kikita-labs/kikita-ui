import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import {
  TooltipContentExamples,
  TooltipPlacementExamples,
  TooltipProviderExamples,
  TooltipTriggerExamples,
} from './components';

/** Shows Tooltip placement, interaction modes, content boundaries, and provider precedence. */
@Component({
  selector: 'app-tooltip',
  imports: [
    PlaygroundExampleCard,
    TooltipContentExamples,
    TooltipPlacementExamples,
    TooltipProviderExamples,
    TooltipTriggerExamples,
    KuiTextDirective,
    TranslocoPipe,
  ],
  templateUrl: './tooltip.html',
  styleUrl: './tooltip.scss',
})
export class Tooltip {}
