import { Component } from '@angular/core';

import {
  KuiBreadcrumbItem,
  KuiBreadcrumbs,
  KuiBreadcrumbSeparator,
  KuiText,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import {
  BreadcrumbsCompositionExamples,
  BreadcrumbsNarrowLayoutExamples,
  BreadcrumbsSizeExamples,
} from './components';

/** Shows the supported Breadcrumbs sizes, item compositions, and consumer-owned narrow layouts. */
@Component({
  selector: 'app-breadcrumbs',
  imports: [
    BreadcrumbsCompositionExamples,
    BreadcrumbsNarrowLayoutExamples,
    BreadcrumbsSizeExamples,
    KuiBreadcrumbItem,
    KuiBreadcrumbSeparator,
    KuiBreadcrumbs,
    KuiText,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './breadcrumbs.html',
  styleUrl: './breadcrumbs.scss',
})
export class Breadcrumbs {}
