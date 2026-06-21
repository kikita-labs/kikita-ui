import { Component } from '@angular/core';

import {
  KuiButtonDirective,
  KuiGroupDirective,
  KuiIconButtonDirective,
  KuiIconComponent,
} from '@kikita-labs/ui';

@Component({
  selector: 'app-group-page',
  imports: [KuiButtonDirective, KuiGroupDirective, KuiIconButtonDirective, KuiIconComponent],
  templateUrl: './group.page.html',
})
export class GroupPage {}
