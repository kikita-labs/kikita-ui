import { Component } from '@angular/core';

import { KuiButtonDirective, KuiLoaderDirective } from '@kikita-labs/ui';

@Component({
  selector: 'app-loader-page',
  imports: [KuiButtonDirective, KuiLoaderDirective],
  templateUrl: './loader.page.html',
})
export class LoaderPage {
  protected readonly sizeRows = [
    { value: 'xs' as const, label: 'xs' },
    { value: 'sm' as const, label: 'sm' },
    { value: 'md' as const, label: 'md (default)' },
    { value: 'lg' as const, label: 'lg' },
  ];
}
