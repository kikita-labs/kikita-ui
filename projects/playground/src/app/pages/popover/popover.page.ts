import { Component, ViewEncapsulation } from '@angular/core';

import {
  KuiButtonDirective,
  KuiColorInputDirective,
  KuiFieldComponent,
  KuiInputDirective,
  KuiPopoverComponent,
  KuiPopoverForDirective,
} from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-popover-page',
  templateUrl: './popover.page.html',
  styleUrl: './popover.page.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    KuiButtonDirective,
    KuiColorInputDirective,
    KuiFieldComponent,
    KuiInputDirective,
    KuiPopoverComponent,
    KuiPopoverForDirective,
    PlaygroundPanelComponent,
  ],
})
export class PopoverPage {}
