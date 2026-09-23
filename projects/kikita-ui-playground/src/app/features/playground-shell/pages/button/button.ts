import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import { ButtonComposition, ButtonStates, ButtonVariantMatrix } from './components';

@Component({
  selector: 'app-button',
  imports: [ButtonComposition, ButtonStates, ButtonVariantMatrix, KuiTextDirective, TranslocoPipe],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {}
