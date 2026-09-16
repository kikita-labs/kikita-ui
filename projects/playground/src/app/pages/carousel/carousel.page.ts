import { Component, signal, ViewEncapsulation } from '@angular/core';

import { KuiCarouselComponent, KuiCarouselSlideDirective } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

/**
 * Self-contained placeholder slides (inline SVG data URIs, no network dependency) -- the same
 * convention `kui-media-viewer`'s playground page uses.
 */
function placeholderSlide(index: number, hue: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
    <rect width="640" height="360" fill="hsl(${hue} 55% 45%)" />
    <text x="320" y="180" font-family="sans-serif" font-size="56" fill="white" text-anchor="middle" dominant-baseline="middle">${index + 1}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

@Component({
  selector: 'app-carousel-page',
  imports: [KuiCarouselComponent, KuiCarouselSlideDirective, PlaygroundPanelComponent],
  templateUrl: './carousel.page.html',
  styleUrl: './carousel.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CarouselPage {
  protected readonly slides = Array.from({ length: 5 }, (_, i) => placeholderSlide(i, i * 60));

  protected readonly defaultIndex = signal(0);
  protected readonly loopIndex = signal(0);
  protected readonly ipv2Index = signal(0);
  protected readonly ipv3Index = signal(0);
  protected readonly noNavIndex = signal(0);
}
