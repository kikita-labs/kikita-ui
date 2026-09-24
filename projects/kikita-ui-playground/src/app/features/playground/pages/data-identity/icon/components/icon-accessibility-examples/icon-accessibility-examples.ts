import { Component } from '@angular/core';

import { KuiIconComponent, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Contrasts decorative and explicitly named Icon output. */
@Component({
  selector: 'app-icon-accessibility-examples',
  imports: [KuiIconComponent, KuiTextDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './icon-accessibility-examples.html',
  styleUrl: './icon-accessibility-examples.scss',
})
export class IconAccessibilityExamples {}
