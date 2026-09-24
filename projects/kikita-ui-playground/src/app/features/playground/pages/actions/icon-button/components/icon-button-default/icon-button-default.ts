import { Component } from '@angular/core';

import { KuiIconButtonDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows a minimally configured icon button. */
@Component({
  selector: 'app-icon-button-default',
  imports: [KuiIconButtonDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './icon-button-default.html',
})
export class IconButtonDefault {}
