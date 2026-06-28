import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';

import { KuiSliderDirective } from './kui-slider.directive';

@Component({
  template: `
    <input
      type="range"
      kuiSlider
      [attr.min]="min"
      [attr.max]="max"
      [attr.value]="value"
      [color]="color"
      [size]="size"
      [disabled]="disabled || null"
      [minLabel]="minLabel"
      [maxLabel]="maxLabel"
    />
  `,
  imports: [KuiSliderDirective],
})
class TestHostComponent {
  value = 50;
  min = 0;
  max = 100;
  color: 'primary' | 'success' | 'danger' | 'neutral' = 'primary';
  size: 'sm' | 'md' | 'lg' = 'md';
  disabled = false;
  minLabel = '';
  maxLabel = '';
}

describe('KuiSliderDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  function native() {
    return fixture.debugElement.query(By.css('.kui-slider-native'))
      ?.nativeElement as HTMLInputElement;
  }

  function container() {
    return fixture.debugElement.query(By.css('.kui-slider'))
      ?.nativeElement as HTMLElement;
  }

  function fill() {
    return fixture.debugElement.query(By.css('.kui-slider-fill'))
      ?.nativeElement as HTMLElement;
  }

  function thumb() {
    return fixture.debugElement.query(By.css('.kui-slider-thumb'))
      ?.nativeElement as HTMLElement;
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
    host.value = 0;
    fixture.detectChanges();
    expect(fill().style.width).toBe('0%');
  });

  it('fill width is 100% when value equals max', () => {
    host.value = 100;
    fixture.detectChanges();
    expect(fill().style.width).toBe('100%');
  });

  it('no data-kui-disabled when enabled', () => {
    expect(container().hasAttribute('data-kui-disabled')).toBe(false);
  });

  it('no labels div when labels empty', () => {
    expect(fixture.debugElement.query(By.css('.kui-slider-labels'))).toBeNull();
  });

  it('renders labels div when minLabel provided', () => {
    host.minLabel = '0';
    host.maxLabel = '100';
    fixture.detectChanges();
    const labels = fixture.debugElement.query(By.css('.kui-slider-labels'));
    expect(labels).not.toBeNull();
  });

  it('changes color attribute when input changes', () => {
    host.color = 'success';
    fixture.detectChanges();
    expect(container().dataset['kuiColor']).toBe('success');
  });

  it('changes size attribute when input changes', () => {
    host.size = 'lg';
    fixture.detectChanges();
    expect(container().dataset['kuiSize']).toBe('lg');
  });
});
