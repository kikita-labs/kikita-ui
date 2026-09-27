import { Component } from '@angular/core';

import { KuiButtonDirective, KuiTooltipDirective } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

/** Shows all four public Tooltip interaction modes on native buttons. */
@Component({
  selector: 'app-tooltip-trigger-examples',
  imports: [KuiButtonDirective, KuiTooltipDirective, TranslocoPipe],
  templateUrl: './tooltip-trigger-examples.html',
  styleUrl: './tooltip-trigger-examples.scss',
})
export class TooltipTriggerExamples {}
