import { Component, signal } from '@angular/core';

import {
  KuiButtonDirective,
  KuiCarouselComponent,
  KuiCarouselSlideDirective,
  KuiTextDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { CAROUSEL_SLIDES_FIVE, CAROUSEL_SLIDES_THREE } from '../constants';
import { CarouselSlideLabel } from './carousel-slide-label';

/** Shows the default Carousel, the two-way index model, loop, and multiple slides per view. */
@Component({
  selector: 'app-carousel-basic-examples',
  imports: [
    CarouselSlideLabel,
    KuiButtonDirective,
    KuiCarouselComponent,
    KuiCarouselSlideDirective,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './carousel-basic-examples.html',
  styleUrl: './carousel-basic-examples.scss',
})
export class CarouselBasicExamples {
  protected readonly threeSlides = CAROUSEL_SLIDES_THREE;
  protected readonly fiveSlides = CAROUSEL_SLIDES_FIVE;

  protected readonly modelIndex = signal(0);

  protected goToThird(): void {
    this.modelIndex.set(2);
  }

  protected reset(): void {
    this.modelIndex.set(0);
  }
}
