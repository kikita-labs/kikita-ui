import { Component } from '@angular/core';

import {
  KuiGroupDirective,
  KuiIconButtonDirective,
  KuiInputDirective,
  KuiTextDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { GroupSizeScopedDefault } from './components';

@Component({
  selector: 'app-group-sizes',
  imports: [
    GroupSizeScopedDefault,
    KuiGroupDirective,
    KuiIconButtonDirective,
    KuiInputDirective,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './group-sizes.html',
  styleUrl: './group-sizes.scss',
})
export class GroupSizes {}
