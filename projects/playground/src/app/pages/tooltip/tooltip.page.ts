import { Component, ViewEncapsulation } from '@angular/core';

import {
  KuiButtonDirective,
  KuiIconButtonDirective,
  KuiIconComponent,
  KuiTooltipDirective,
} from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-tooltip-page',
  imports: [KuiButtonDirective, KuiIconButtonDirective, KuiIconComponent, KuiTooltipDirective, PlaygroundPanelComponent],
  templateUrl: './tooltip.page.html',
  styleUrl: './tooltip.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TooltipPage {}
