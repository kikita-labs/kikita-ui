import { Component, input } from '@angular/core';

import { KuiIconComponent, KuiTextDirective } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-workspace-placeholder',
  imports: [KuiIconComponent, KuiTextDirective, TranslocoPipe],
  templateUrl: './workspace-placeholder.html',
  styleUrl: './workspace-placeholder.scss',
})
export class WorkspacePlaceholder {
  readonly selectedComponent = input<string | null>(null);
}
