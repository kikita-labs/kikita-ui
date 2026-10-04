import { Component } from '@angular/core';

import { KuiText } from '@kikita-labs/ui';

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
    KuiText,
    TranslocoPipe,
  ],
  templateUrl: './tooltip.html',
  styleUrl: './tooltip.scss',
})
export class Tooltip {}
