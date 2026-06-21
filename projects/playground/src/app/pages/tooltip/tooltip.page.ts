import { Component } from '@angular/core';

import {
  KuiButtonDirective,
  KuiIconButtonDirective,
  KuiIconComponent,
  KuiTooltipDirective,
} from '@kikita-labs/ui';

@Component({
  selector: 'app-tooltip-page',
  imports: [KuiButtonDirective, KuiIconButtonDirective, KuiIconComponent, KuiTooltipDirective],
  templateUrl: './tooltip.page.html',
})
export class TooltipPage {}
