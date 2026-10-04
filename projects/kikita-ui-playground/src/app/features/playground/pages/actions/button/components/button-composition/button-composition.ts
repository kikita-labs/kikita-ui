import { Component } from '@angular/core';

import { KuiButton } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-button-composition',
  imports: [KuiButton, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './button-composition.html',
  styleUrl: './button-composition.scss',
})
export class ButtonComposition {}
