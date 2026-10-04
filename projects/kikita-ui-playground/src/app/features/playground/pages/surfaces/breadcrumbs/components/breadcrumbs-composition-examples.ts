import { Component } from '@angular/core';

import {
  KuiBreadcrumbItem,
  KuiBreadcrumbs,
  KuiBreadcrumbSeparator,
  KuiText,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows mixed native crumb content and the documented leading-icon composition. */
@Component({
  selector: 'app-breadcrumbs-composition-examples',
  imports: [
    KuiBreadcrumbItem,
    KuiBreadcrumbSeparator,
    KuiBreadcrumbs,
    KuiText,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './breadcrumbs-composition-examples.html',
  styleUrl: './breadcrumbs-composition-examples.scss',
})
export class BreadcrumbsCompositionExamples {}
