import { Component } from '@angular/core';

import { KuiField, KuiRadio, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows a labelled native radio group with Kikita field hint wiring. */
@Component({
  selector: 'app-radio-default',
  imports: [KuiField, KuiRadio, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './radio-default.html',
  styleUrl: './radio-default.scss',
})
export class RadioDefault {}
