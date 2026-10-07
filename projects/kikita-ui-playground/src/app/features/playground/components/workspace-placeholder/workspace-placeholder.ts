import { Component, input } from '@angular/core';

import { KuiIcon, KuiText } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-workspace-placeholder',
  imports: [KuiIcon, KuiText, TranslocoPipe],
  templateUrl: './workspace-placeholder.html',
  styleUrl: './workspace-placeholder.scss',
})
export class WorkspacePlaceholder {
  readonly selectedComponent = input<string | null>(null);
}
