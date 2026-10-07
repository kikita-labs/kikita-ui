import { Component } from '@angular/core';

import { KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import {
  DialogAppearanceExamples,
  DialogBehaviorExamples,
  DialogConfirmExamples,
  DialogSizeExamples,
} from './components';

/** Shows Dialog sizes, appearances, content, dismissal, and confirmation behavior. */
@Component({
  selector: 'app-dialog',
  imports: [
    DialogAppearanceExamples,
    DialogBehaviorExamples,
    DialogConfirmExamples,
    DialogSizeExamples,
    PlaygroundExampleCard,
    KuiText,
    TranslocoPipe,
  ],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
})
export class Dialog {}
