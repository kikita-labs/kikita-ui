import { Component } from '@angular/core';

import { KuiText } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import { ButtonComposition, ButtonDefault, ButtonStates, ButtonVariantMatrix } from './components';

@Component({
  selector: 'app-button',
  imports: [
    ButtonComposition,
    ButtonDefault,
    ButtonStates,
    ButtonVariantMatrix,
    KuiText,
    TranslocoPipe,
  ],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {}
