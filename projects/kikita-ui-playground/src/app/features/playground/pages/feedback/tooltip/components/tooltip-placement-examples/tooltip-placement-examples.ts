import { Component } from '@angular/core';

import { KuiButtonDirective, KuiTooltipDirective } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

/** Provides named triggers for each Tooltip placement. */
@Component({
  selector: 'app-tooltip-placement-examples',
  imports: [KuiButtonDirective, KuiTooltipDirective, TranslocoPipe],
  templateUrl: './tooltip-placement-examples.html',
  styleUrl: './tooltip-placement-examples.scss',
})
export class TooltipPlacementExamples {}
