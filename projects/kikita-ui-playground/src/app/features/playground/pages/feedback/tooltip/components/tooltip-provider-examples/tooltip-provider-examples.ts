import { Component } from '@angular/core';

import {
  KuiButton,
  kuiProvideTooltipOptions,
  KuiTooltip,
  KuiTooltipTriggerType,
} from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

/** Shows a scoped Hover default and a local Click override. */
@Component({
  selector: 'app-tooltip-provider-examples',
  imports: [KuiButton, KuiTooltip, TranslocoPipe],
  providers: [kuiProvideTooltipOptions({ triggerType: KuiTooltipTriggerType.Hover })],
  templateUrl: './tooltip-provider-examples.html',
  styleUrl: './tooltip-provider-examples.scss',
})
export class TooltipProviderExamples {}
