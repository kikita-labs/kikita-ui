import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { KuiCarousel, KuiCarouselSlide } from '../components/carousel';
import { KuiLineChart } from '../components/chart';
import { KuiIdSequences } from './kui-id.util';

@Component({
  imports: [KuiCarousel, KuiCarouselSlide, KuiLineChart],
  template: `
    <kui-carousel ariaLabel="First">
      <div kuiCarouselSlide>One</div>
    </kui-carousel>
    <kui-carousel ariaLabel="Second">
      <div kuiCarouselSlide>Two</div>
    </kui-carousel>
    <kui-line-chart ariaLabel="Trend" [categories]="['a']" [series]="[]" />
  `,
})
class HostComponent {}

function renderedIds(): string[] {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();

  const ids = Array.from(
    (fixture.nativeElement as HTMLElement).querySelectorAll('[id^="kui-"]'),
    (element) => element.id,
  );
  fixture.destroy();

  return ids;
}

describe('application-scoped id sequences', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('counts each prefix separately from zero, and from the requested first number', () => {
    const sequences = TestBed.inject(KuiIdSequences);

    expect(sequences.next('kui-alpha')).toBe('kui-alpha-0');
    expect(sequences.next('kui-alpha')).toBe('kui-alpha-1');
    expect(sequences.next('kui-beta')).toBe('kui-beta-0');
    expect(sequences.next('kui-gamma', 1)).toBe('kui-gamma-1');
    expect(sequences.next('kui-gamma', 1)).toBe('kui-gamma-2');
  });

  it('keeps sequences independent between applications', () => {
    const first = TestBed.inject(KuiIdSequences);
    first.next('kui-alpha');
    first.next('kui-alpha');

    TestBed.resetTestingModule();

    expect(TestBed.inject(KuiIdSequences).next('kui-alpha')).toBe('kui-alpha-0');
  });

  it('gives two separate renders of the same template identical component ids', () => {
    const firstRender = renderedIds();

    TestBed.resetTestingModule();
    const secondRender = renderedIds();

    expect(firstRender.length).toBeGreaterThan(0);
    expect(firstRender.some((id) => id.startsWith('kui-carousel-0'))).toBe(true);
    expect(firstRender.some((id) => id.startsWith('kui-carousel-1'))).toBe(true);
    expect(secondRender).toEqual(firstRender);
  });
});
