import { Component } from '@angular/core';

import { KuiError, KuiField, KuiHint, KuiInput, KuiLabel } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-field-projected',
  imports: [KuiError, KuiField, KuiHint, KuiInput, KuiLabel, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './field-projected.html',
})
export class FieldProjected {}
