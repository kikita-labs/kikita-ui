import { Component } from '@angular/core';

import { KuiIcon, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Contrasts decorative and explicitly named Icon output. */
@Component({
  selector: 'app-icon-accessibility-examples',
  imports: [KuiIcon, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './icon-accessibility-examples.html',
  styleUrl: './icon-accessibility-examples.scss',
})
export class IconAccessibilityExamples {}
