import { Component } from '@angular/core';

import { KuiButton, KuiGroup, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-group-layouts',
  imports: [KuiButton, KuiGroup, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './group-layouts.html',
  styleUrl: './group-layouts.scss',
})
export class GroupLayouts {}
