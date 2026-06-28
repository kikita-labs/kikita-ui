import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { KuiSliderDirective } from './kui-slider.directive';

@Component({
  template: `
    <input
      type="range"
      kuiSlider
      [attr.min]="min()"
      [attr.max]="max()"
      [value]="value()"
      [color]="color()"
      [size]="size()"
      [disabled]="disabled() || null"
      [minLabel]="minLabel()"
      [maxLabel]="maxLabel()"
    />
  `,
  imports: [KuiSliderDirective],
})
class TestHostComponent {
  readonly value = signal(50);
  readonly min = signal(0);
  readonly max = signal(100);
  readonly color = signal<'primary' | 'success' | 'danger' | 'neutral'>('primary');
  readonly size = signal<'sm' | 'md' | 'lg'>('md');
  readonly disabled = signal(false);
  readonly minLabel = signal('');
  readonly maxLabel = signal('');
}

describe('KuiSliderDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  function native() {
    return fixture.nativeElement.querySelector('.kui-slider-native') as HTMLInputElement;
  }

  function container() {
    return fixture.nativeElement.querySelector('.kui-slider') as HTMLElement;
  }

  function fill() {
    return fixture.nativeElement.querySelector('.kui-slider-fill') as HTMLElement;
  }

  function thumb() {
    return fixture.nativeElement.querySelector('.kui-slider-thumb') as HTMLElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('wraps native input in .kui-slider container', () => {
    expect(container()).toBeTruthy();
  });

  it('native input has class kui-slider-native', () => {
    expect(native().classList.contains('kui-slider-native')).toBe(true);
  });

  it('sets data-kui-color on container', () => {
    expect(container().dataset['kuiColor']).toBe('primary');
  });

  it('sets data-kui-size on container', () => {
    expect(container().dataset['kuiSize']).toBe('md');
  });

  it('fill width is 50% when value=50 min=0 max=100', () => {
    expect(fill().style.width).toBe('50%');
  });

  it('thumb left equals fill width', () => {
    expect(thumb().style.left).toBe(fill().style.width);
  });

  it('fill width is 0% when value equals min', () => {
    host.value.set(0);
    fixture.detectChanges();
    expect(fill().style.width).toBe('0%');
  });

  it('fill width is 100% when value equals max', () => {
    host.value.set(100);
    fixture.detectChanges();
    expect(fill().style.width).toBe('100%');
  });

  it('no data-kui-disabled when enabled', () => {
    expect(container().hasAttribute('data-kui-disabled')).toBe(false);
  });

  it('no labels div when labels empty', () => {
    expect(fixture.nativeElement.querySelector('.kui-slider-labels')).toBeNull();
  });

  it('renders labels div when minLabel provided', () => {
    host.minLabel.set('0');
    host.maxLabel.set('100');
    fixture.detectChanges();
    const labels = fixture.nativeElement.querySelector('.kui-slider-labels');
    expect(labels).not.toBeNull();
  });

  it('changes color attribute when input changes', () => {
    host.color.set('success');
    fixture.detectChanges();
    expect(container().dataset['kuiColor']).toBe('success');
  });

  it('changes size attribute when input changes', () => {
    host.size.set('lg');
    fixture.detectChanges();
    expect(container().dataset['kuiSize']).toBe('lg');
  });
});
