import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import {
  TextareaDefault,
  TextareaExplicitId,
  TextareaSizes,
  TextareaStates,
  TextareaValidation,
} from './components';

/** Shows native textarea defaults, sizes, states, explicit ids, and Signal Forms integration. */
@Component({
  selector: 'app-textarea',
  imports: [
    TextareaDefault,
    TextareaExplicitId,
    TextareaSizes,
    TextareaStates,
    TextareaValidation,
    KuiTextDirective,
    TranslocoPipe,
  ],
  templateUrl: './textarea.html',
  styleUrl: './textarea.scss',
})
export class Textarea {}
