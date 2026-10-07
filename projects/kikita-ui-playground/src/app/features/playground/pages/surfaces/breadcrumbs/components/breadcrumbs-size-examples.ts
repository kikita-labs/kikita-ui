import { Component } from '@angular/core';

import {
  KuiBreadcrumbItem,
  KuiBreadcrumbs,
  KuiBreadcrumbSeparator,
  KuiText,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Compares Breadcrumbs' three supported sizes. */
@Component({
  selector: 'app-breadcrumbs-size-examples',
  imports: [
    KuiBreadcrumbItem,
    KuiBreadcrumbSeparator,
    KuiBreadcrumbs,
    KuiText,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './breadcrumbs-size-examples.html',
  styleUrl: './breadcrumbs-size-examples.scss',
})
export class BreadcrumbsSizeExamples {
  protected readonly sizes = [
    { key: 'small', value: 'sm' },
    { key: 'medium', value: 'md' },
    { key: 'large', value: 'lg' },
  ] as const;
}
