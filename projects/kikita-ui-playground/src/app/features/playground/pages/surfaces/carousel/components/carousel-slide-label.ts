import { Component, input } from '@angular/core';

import { KuiText } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

/** Renders the local text content of one Carousel example slide. */
@Component({
  selector: 'app-carousel-slide-label',
  imports: [KuiText, TranslocoPipe],
  templateUrl: './carousel-slide-label.html',
  styleUrl: './carousel-slide-label.scss',
})
export class CarouselSlideLabel {
  /** One-based slide number shown in the slide. */
  readonly number = input.required<number>();
}
