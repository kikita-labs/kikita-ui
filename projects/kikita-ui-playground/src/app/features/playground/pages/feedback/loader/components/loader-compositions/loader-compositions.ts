import { Component } from '@angular/core';

import {
  KuiButtonDirective,
  KuiFieldAffixDirective,
  KuiFieldComponent,
  KuiInputDirective,
  KuiLoaderDirective,
  KuiTextDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows Loader in the documented button and field-affix compositions. */
@Component({
  selector: 'app-loader-compositions',
  imports: [
    KuiButtonDirective,
    KuiFieldAffixDirective,
    KuiFieldComponent,
    KuiInputDirective,
    KuiLoaderDirective,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './loader-compositions.html',
  styleUrl: './loader-compositions.scss',
})
export class LoaderCompositions {}
