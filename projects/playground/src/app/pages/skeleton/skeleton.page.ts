import { Component, ViewEncapsulation } from '@angular/core';

import { KuiCardDirective, KuiSkeletonDirective } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-skeleton-page',
  imports: [KuiCardDirective, KuiSkeletonDirective, PlaygroundPanelComponent],
  templateUrl: './skeleton.page.html',
  styleUrl: './skeleton.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SkeletonPage {}
