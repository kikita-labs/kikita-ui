import { Component } from '@angular/core';

import {
  KuiButtonDirective,
  KuiPopoverComponent,
  KuiPopoverForDirective,
  KuiTextDirective,
} from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import { POPOVER_POSITIONS } from '../../constants';

/** Shows all supported Popover side and cross-axis alignment combinations. */
@Component({
  selector: 'app-popover-position-examples',
  imports: [
    KuiButtonDirective,
    KuiPopoverComponent,
    KuiPopoverForDirective,
    KuiTextDirective,
    TranslocoPipe,
  ],
  templateUrl: './popover-position-examples.html',
  styleUrl: './popover-position-examples.scss',
})
export class PopoverPositionExamples {
  protected readonly positions = POPOVER_POSITIONS;
}
