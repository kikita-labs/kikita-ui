import { Component } from '@angular/core';

import { KuiAlert, KuiChip, KuiIcon, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import {
  ICON_CHROME_STROKE_VARIANTS,
  ICON_STROKE_DEMO_GLYPH,
  ICON_STROKE_SIZES,
  ICON_STROKE_WIDTHS,
} from './constants';

/** Compares stroke widths, scaling versus constant-pixel strokes, and the stroke token on structural icons. */
@Component({
  selector: 'app-icon-stroke-examples',
  imports: [KuiAlert, KuiChip, KuiIcon, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './icon-stroke-examples.html',
  styleUrl: './icon-stroke-examples.scss',
})
export class IconStrokeExamples {
  protected readonly glyph = ICON_STROKE_DEMO_GLYPH;
  protected readonly widths = ICON_STROKE_WIDTHS;
  protected readonly sizes = ICON_STROKE_SIZES;
  protected readonly chromeVariants = ICON_CHROME_STROKE_VARIANTS;
}
