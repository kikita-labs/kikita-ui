import { Component } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import {
  CarouselAutoplayExamples,
  CarouselBasicExamples,
  CarouselNavigationExamples,
} from './components';

/** Shows Carousel defaults, navigation options, dragging, and autoplay with local text slides. */
@Component({
  selector: 'app-carousel',
  imports: [
    CarouselAutoplayExamples,
    CarouselBasicExamples,
    CarouselNavigationExamples,
    KuiTextDirective,
    TranslocoPipe,
  ],
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss',
})
export class Carousel {}
