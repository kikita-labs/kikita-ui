import { Component } from '@angular/core';

import { KuiButton, KuiPopover, KuiPopoverFor, KuiText } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import { POPOVER_POSITIONS } from '../../constants';

/** Shows all supported Popover side and cross-axis alignment combinations. */
@Component({
  selector: 'app-popover-position-examples',
  imports: [KuiButton, KuiPopover, KuiPopoverFor, KuiText, TranslocoPipe],
  templateUrl: './popover-position-examples.html',
  styleUrl: './popover-position-examples.scss',
})
export class PopoverPositionExamples {
  protected readonly positions = POPOVER_POSITIONS;
}
