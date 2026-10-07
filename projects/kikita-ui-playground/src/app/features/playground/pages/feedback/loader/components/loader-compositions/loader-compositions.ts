import { Component } from '@angular/core';

import { KuiButton, KuiField, KuiFieldAffix, KuiInput, KuiLoader, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows Loader in the documented button and field-affix compositions. */
@Component({
  selector: 'app-loader-compositions',
  imports: [
    KuiButton,
    KuiFieldAffix,
    KuiField,
    KuiInput,
    KuiLoader,
    KuiText,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './loader-compositions.html',
  styleUrl: './loader-compositions.scss',
})
export class LoaderCompositions {}
