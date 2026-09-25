import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import {
  GroupCompositions,
  GroupFieldCombinations,
  GroupLayouts,
  GroupMultipleFields,
  GroupSizes,
} from './components';

/** Shows Group's layout, collapsed borders, sizing, and control composition. */
@Component({
  selector: 'app-group',
  imports: [
    GroupCompositions,
    GroupFieldCombinations,
    GroupLayouts,
    GroupMultipleFields,
    GroupSizes,
    KuiTextDirective,
    TranslocoPipe,
  ],
  templateUrl: './group.html',
  styleUrl: './group.scss',
})
export class Group {}
