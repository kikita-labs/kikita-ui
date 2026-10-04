import { Component } from '@angular/core';

import { KuiGroup, KuiIconButton, KuiInput, KuiText, provideKuiDefaults } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

/** Shows a group resolving its size from a component-scoped Kikita UI default. */
@Component({
  selector: 'app-group-size-scoped-default',
  providers: [provideKuiDefaults({ size: 'lg' })],
  imports: [KuiGroup, KuiIconButton, KuiInput, KuiText, TranslocoPipe],
  templateUrl: './group-size-scoped-default.html',
  styleUrl: './group-size-scoped-default.scss',
})
export class GroupSizeScopedDefault {}
