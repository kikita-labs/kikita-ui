import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import type { KuiProgressColor, KuiProgressSize } from './kui-progress.component';
import { KuiProgressComponent } from './kui-progress.component';

@Component({
  imports: [KuiProgressComponent],
  template: `<kui-progress
    [type]="type()"
    [value]="value()"
    [color]="color()"
    [size]="size()"
    aria-label="test"
  />`,
})
class ProgressHost {
  readonly type = signal<'linear' | 'circular'>('linear');
  readonly value = signal<number | null>(null);
  readonly color = signal<KuiProgressColor>('primary');
  readonly size = signal<KuiProgressSize>('md');
}

describe('KuiProgressComponent', () => {
  let fixture: ComponentFixture<ProgressHost>;
  let host: ProgressHost;

  function el(): HTMLElement {
    return fixture.debugElement.query(By.directive(KuiProgressComponent)).nativeElement;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ProgressHost] });
    fixture = TestBed.createComponent(ProgressHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders kui-progress as linear by default', () => {
    expect(el().classList.contains('kui-progress-linear')).toBe(true);
    expect(el().classList.contains('kui-progress-circular')).toBe(false);
  });

  it('has role="progressbar"', () => {
    expect(el().getAttribute('role')).toBe('progressbar');
  });

  it('indeterminate: aria-valuenow absent and data-kui-indeterminate set', () => {
    host.value.set(null);
    fixture.detectChanges();
    expect(el().hasAttribute('aria-valuenow')).toBe(false);
    expect(el().getAttribute('data-kui-indeterminate')).toBe('true');
  });

  it('determinate: aria-valuenow equals value', () => {
    host.value.set(65);
    fixture.detectChanges();
    expect(el().getAttribute('aria-valuenow')).toBe('65');
    expect(el().hasAttribute('data-kui-indeterminate')).toBe(false);
  });

  it('linear fill width matches value', () => {
    host.value.set(40);
    fixture.detectChanges();
    const fill = el().querySelector('.kui-progress-linear-fill') as HTMLElement;
    expect(fill.style.width).toBe('40%');
  });

  it('linear clamps value to 0-100', () => {
    host.value.set(150);
    fixture.detectChanges();
    const fill = el().querySelector('.kui-progress-linear-fill') as HTMLElement;
    expect(fill.style.width).toBe('100%');
    expect(el().getAttribute('aria-valuenow')).toBe('100');
  });

  it('data-kui-color and data-kui-size applied to host', () => {
    host.color.set('success');
    host.size.set('sm');
    fixture.detectChanges();
    expect(el().getAttribute('data-kui-color')).toBe('success');
    expect(el().getAttribute('data-kui-size')).toBe('sm');
  });

  it('circular: renders svg and not fill div', () => {
    host.type.set('circular');
    fixture.detectChanges();
    expect(el().classList.contains('kui-progress-circular')).toBe(true);
    expect(el().querySelector('svg')).toBeTruthy();
    expect(el().querySelector('.kui-progress-linear-fill')).toBeNull();
  });

  it('circular md: svg dimensions are 36x36', () => {
    host.type.set('circular');
    host.size.set('md');
    fixture.detectChanges();
    const svg = el().querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('36');
    expect(svg.getAttribute('height')).toBe('36');
  });

  it('circular xl: svg dimensions are 64x64', () => {
    host.type.set('circular');
    host.size.set('xl');
    fixture.detectChanges();
    const svg = el().querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('64');
    expect(svg.getAttribute('height')).toBe('64');
  });

  it('circular determinate: dashoffset = circumference*(1 - value/100)', () => {
    host.type.set('circular');
    host.size.set('md');
    host.value.set(60);
    fixture.detectChanges();
    const fill = el().querySelector('.kui-progress-circular-fill')!;
    const offset = parseFloat(fill.getAttribute('stroke-dashoffset')!);
    expect(offset).toBeCloseTo(103.67 * 0.4, 1);
  });

  it('circular indeterminate: dashoffset = circumference * 0.25', () => {
    host.type.set('circular');
    host.size.set('md');
    host.value.set(null);
    fixture.detectChanges();
    const fill = el().querySelector('.kui-progress-circular-fill')!;
    const offset = parseFloat(fill.getAttribute('stroke-dashoffset')!);
    expect(offset).toBeCloseTo(103.67 * 0.25, 1);
  });
});
