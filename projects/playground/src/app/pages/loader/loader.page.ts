import { Component, ViewEncapsulation } from '@angular/core';

import { KuiButtonDirective, KuiLoaderDirective } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-loader-page',
  imports: [KuiButtonDirective, KuiLoaderDirective, PlaygroundPanelComponent],
  templateUrl: './loader.page.html',
  styleUrl: './loader.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LoaderPage {
  protected readonly sizeRows = [
    { value: 'xs' as const, label: 'xs' },
    { value: 'sm' as const, label: 'sm' },
    { value: 'md' as const, label: 'md (default)' },
    { value: 'lg' as const, label: 'lg' },
  ];
}
