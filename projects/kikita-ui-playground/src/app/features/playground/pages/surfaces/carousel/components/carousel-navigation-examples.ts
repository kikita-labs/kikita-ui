import { Component, signal } from '@angular/core';

import { KuiCarouselComponent, KuiCarouselSlideDirective, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { CAROUSEL_SLIDES_THREE } from '../constants';
import { CarouselSlideLabel } from './carousel-slide-label';

/** Shows Carousel navigation visibility options and the draggable input. */
@Component({
  selector: 'app-carousel-navigation-examples',
  imports: [
    CarouselSlideLabel,
    KuiCarouselComponent,
    KuiCarouselSlideDirective,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './carousel-navigation-examples.html',
  styleUrl: './carousel-navigation-examples.scss',
})
export class CarouselNavigationExamples {
  protected readonly threeSlides = CAROUSEL_SLIDES_THREE;

  protected readonly swipeIndex = signal(0);
  protected readonly draggableIndex = signal(0);
  protected readonly lockedIndex = signal(0);
}
