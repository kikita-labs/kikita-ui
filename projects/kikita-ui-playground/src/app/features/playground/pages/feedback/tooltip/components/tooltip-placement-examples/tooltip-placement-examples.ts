import { Component } from '@angular/core';

import { KuiButton, KuiTooltip } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

/** Provides named triggers for each Tooltip placement. */
@Component({
  selector: 'app-tooltip-placement-examples',
  imports: [KuiButton, KuiTooltip, TranslocoPipe],
  templateUrl: './tooltip-placement-examples.html',
  styleUrl: './tooltip-placement-examples.scss',
})
export class TooltipPlacementExamples {}
