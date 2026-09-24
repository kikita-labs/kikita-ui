import { Component } from '@angular/core';

import { KuiButtonDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-button-composition',
  imports: [KuiButtonDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './button-composition.html',
  styleUrl: './button-composition.scss',
})
export class ButtonComposition {}
