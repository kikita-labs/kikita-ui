import { Component } from '@angular/core';

import { KuiButtonDirective, KuiGroupDirective, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-group-layouts',
  imports: [
    KuiButtonDirective,
    KuiGroupDirective,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './group-layouts.html',
  styleUrl: './group-layouts.scss',
})
export class GroupLayouts {}
