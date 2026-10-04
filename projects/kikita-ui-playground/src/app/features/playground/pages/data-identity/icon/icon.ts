import { Component } from '@angular/core';

import { KuiIcon, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import {
  IconAccessibilityExamples,
  IconSizeExamples,
  IconSourceExamples,
  IconStrokeExamples,
  IconStructuralExamples,
} from './components';

/** Shows Icon sizing, source, and accessible-name behavior in the playground. */
@Component({
  selector: 'app-icon',
  imports: [
    IconAccessibilityExamples,
    IconSizeExamples,
    IconSourceExamples,
    IconStrokeExamples,
    IconStructuralExamples,
    KuiIcon,
    KuiText,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
})
export class Icon {}
