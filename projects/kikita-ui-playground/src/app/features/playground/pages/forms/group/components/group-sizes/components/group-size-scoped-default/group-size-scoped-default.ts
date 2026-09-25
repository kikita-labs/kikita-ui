import { Component } from '@angular/core';

import {
  KIKITA_UI_OPTIONS,
  KuiGroupDirective,
  KuiIconButtonDirective,
  KuiInputDirective,
  KuiTextDirective,
} from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

/** Shows a group resolving its size from a component-scoped Kikita UI default. */
@Component({
  selector: 'app-group-size-scoped-default',
  providers: [{ provide: KIKITA_UI_OPTIONS, useValue: { defaults: { size: 'lg' } } }],
  imports: [
    KuiGroupDirective,
    KuiIconButtonDirective,
    KuiInputDirective,
    KuiTextDirective,
    TranslocoPipe,
  ],
  templateUrl: './group-size-scoped-default.html',
  styleUrl: './group-size-scoped-default.scss',
})
export class GroupSizeScopedDefault {}
