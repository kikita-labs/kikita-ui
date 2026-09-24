import { Component } from '@angular/core';

import { KuiColorInputDirective, KuiFieldComponent } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the minimally configured native color input. */
@Component({
  selector: 'app-color-input-default',
  imports: [KuiColorInputDirective, KuiFieldComponent, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './color-input-default.html',
})
export class ColorInputDefault {}
