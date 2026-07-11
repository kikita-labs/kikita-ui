import { Component, ViewEncapsulation } from '@angular/core';

import {
  KuiButtonDirective,
  KuiGroupDirective,
  KuiIconButtonDirective,
  KuiIconComponent,
  KuiInputDirective,
} from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-group-page',
  imports: [
    KuiButtonDirective,
    KuiGroupDirective,
    KuiIconButtonDirective,
    KuiIconComponent,
    KuiInputDirective,
    PlaygroundPanelComponent,
  ],
  templateUrl: './group.page.html',
  styleUrl: './group.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class GroupPage {}
