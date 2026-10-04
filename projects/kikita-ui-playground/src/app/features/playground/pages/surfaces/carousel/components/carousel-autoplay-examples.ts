import { Component, signal } from '@angular/core';

import { KuiCarousel, KuiCarouselSlide, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { CAROUSEL_AUTOPLAY_INTERVAL, CAROUSEL_SLIDES_THREE } from '../constants';
import { CarouselSlideLabel } from './carousel-slide-label';

/** Shows looping and non-looping autoplay with the always-visible Play/Pause control. */
@Component({
  selector: 'app-carousel-autoplay-examples',
  imports: [
    CarouselSlideLabel,
    KuiCarousel,
    KuiCarouselSlide,
    KuiText,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './carousel-autoplay-examples.html',
  styleUrl: './carousel-autoplay-examples.scss',
})
export class CarouselAutoplayExamples {
  protected readonly threeSlides = CAROUSEL_SLIDES_THREE;
  protected readonly autoplayInterval = CAROUSEL_AUTOPLAY_INTERVAL;

  protected readonly loopIndex = signal(0);
  protected readonly noLoopIndex = signal(0);
}
