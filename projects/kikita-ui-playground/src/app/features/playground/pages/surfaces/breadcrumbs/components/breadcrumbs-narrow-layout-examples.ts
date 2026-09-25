import { Component } from '@angular/core';

import {
  KuiBreadcrumbItemDirective,
  KuiBreadcrumbsDirective,
  KuiBreadcrumbSeparatorComponent,
  KuiTextDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows consumer-owned truncation, static ellipsis wiring, and first/last composition. */
@Component({
  selector: 'app-breadcrumbs-narrow-layout-examples',
  imports: [
    KuiBreadcrumbItemDirective,
    KuiBreadcrumbSeparatorComponent,
    KuiBreadcrumbsDirective,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './breadcrumbs-narrow-layout-examples.html',
  styleUrl: './breadcrumbs-narrow-layout-examples.scss',
})
export class BreadcrumbsNarrowLayoutExamples {}
