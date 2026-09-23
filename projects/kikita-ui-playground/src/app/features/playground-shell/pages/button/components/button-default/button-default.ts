import { Component } from '@angular/core';

import { KuiButtonDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground-shell/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-button-default',
  imports: [KuiButtonDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './button-default.html',
})
export class ButtonDefault {}
