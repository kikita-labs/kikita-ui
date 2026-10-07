import { Component } from '@angular/core';

import { KuiGroup, KuiIconButton, KuiInput, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { GroupSizeScopedDefault } from './components';

@Component({
  selector: 'app-group-sizes',
  imports: [
    GroupSizeScopedDefault,
    KuiGroup,
    KuiIconButton,
    KuiInput,
    KuiText,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './group-sizes.html',
  styleUrl: './group-sizes.scss',
})
export class GroupSizes {}
