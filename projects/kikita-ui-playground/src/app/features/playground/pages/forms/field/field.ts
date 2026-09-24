import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import {
  FieldAffixes,
  FieldAnatomy,
  FieldDefault,
  FieldProjected,
  FieldProviders,
  FieldSizes,
  FieldValidation,
} from './components';

/** Shows Field defaults, supported sizes, projected content, validation, and affix composition. */
@Component({
  selector: 'app-field',
  imports: [
    FieldAffixes,
    FieldAnatomy,
    FieldDefault,
    FieldProjected,
    FieldProviders,
    FieldSizes,
    FieldValidation,
    KuiTextDirective,
    TranslocoPipe,
  ],
  templateUrl: './field.html',
  styleUrl: './field.scss',
})
export class Field {}
