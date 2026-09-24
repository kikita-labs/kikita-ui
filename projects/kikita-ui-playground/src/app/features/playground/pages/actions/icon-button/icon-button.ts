import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import {
  IconButtonDefault,
  IconButtonIconSources,
  IconButtonStates,
  IconButtonVariantMatrix,
} from './components';

/** Shows Icon Button variants and supported states in the playground. */
@Component({
  selector: 'app-icon-button',
  imports: [
    IconButtonDefault,
    IconButtonIconSources,
    IconButtonStates,
    IconButtonVariantMatrix,
    KuiTextDirective,
    TranslocoPipe,
  ],
  templateUrl: './icon-button.html',
  styleUrl: './icon-button.scss',
})
export class IconButton {}
