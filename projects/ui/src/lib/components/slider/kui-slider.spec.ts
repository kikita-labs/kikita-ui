import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { disabled, form, FormField, max, min } from '@angular/forms/signals';

import { beforeEach, describe, expect, it } from 'vitest';

import { KuiField } from '../field';
import { KuiSlider } from './kui-slider';

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
      [disabled]="disabled()"
      [minLabel]="minLabel()"
      [maxLabel]="maxLabel()"
    />
  `,
  imports: [KuiSlider],
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

@Component({
  template: '<input type="range" kuiSlider minLabel="0" maxLabel="100" />',
  imports: [KuiSlider],
})
class InitiallyLabeledTestHostComponent {}

@Component({
  template: '<input type="range" kuiSlider value="75" />',
  imports: [KuiSlider],
})
class DefaultRangeTestHostComponent {}

@Component({
  template: `
    <kui-field label="Volume">
      <input type="range" kuiSlider [formField]="settingsForm.volume" />
    </kui-field>
  `,
  imports: [FormField, KuiField, KuiSlider],
})
class SignalFormsHostComponent {
  readonly model = signal({ volume: 60 });
  readonly disabled = signal(false);
  readonly settingsForm = form(this.model, (path) => {
    min(path.volume, 0);
    max(path.volume, 100);
    disabled(path.volume, { when: () => this.disabled() });
  });
}

@Component({
  template: `
    <kui-field label="Volume" hint="Use keyboard arrows" error="Volume is required">
      <input type="range" kuiSlider />
    </kui-field>
  `,
  imports: [KuiField, KuiSlider],
})
class FieldWiringHostComponent {}

describe('KuiSlider', () => {
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
      imports: [
        TestHostComponent,
        InitiallyLabeledTestHostComponent,
        DefaultRangeTestHostComponent,
      ],
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

  it('fills the full track when the native maximum is zero', () => {
    host.min.set(-100);
    host.max.set(0);
    host.value.set(0);
    fixture.detectChanges();

    expect(fill().style.width).toBe('100%');
    expect(thumb().style.left).toBe('100%');
  });

  it('uses the native 0–100 range defaults when min and max are omitted', () => {
    const defaultFixture = TestBed.createComponent(DefaultRangeTestHostComponent);

    defaultFixture.detectChanges();

    const input = defaultFixture.nativeElement.querySelector('input') as HTMLInputElement;
    const fill = defaultFixture.nativeElement.querySelector('.kui-slider-fill') as HTMLElement;

    expect(input.getAttribute('min')).toBeNull();
    expect(input.getAttribute('max')).toBeNull();
    expect(input.min).toBe('');
    expect(input.max).toBe('');
    expect(fill.style.width).toBe('75%');
  });

  it('reflects dynamic disabled input to the native control and wrapper', () => {
    expect(native().disabled).toBe(false);
    expect(container().hasAttribute('data-kui-disabled')).toBe(false);

    host.disabled.set(true);
    fixture.detectChanges();

    expect(native().disabled).toBe(true);
    expect(container().getAttribute('data-kui-disabled')).toBe('true');

    host.disabled.set(false);
    fixture.detectChanges();

    expect(native().disabled).toBe(false);
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

  it('renders initially provided endpoint labels after building the browser wrapper', async () => {
    const labeledFixture = TestBed.createComponent(InitiallyLabeledTestHostComponent);

    labeledFixture.detectChanges();

    expect(labeledFixture.nativeElement.querySelector('.kui-slider-labels')?.textContent).toBe(
      '0100',
    );
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

describe('KuiSlider with Angular Signal Forms', () => {
  it('keeps native range and generated fill synced with the form value', async () => {
    await TestBed.configureTestingModule({
      imports: [SignalFormsHostComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(SignalFormsHostComponent);
    fixture.detectChanges();

    const native = fixture.nativeElement.querySelector('.kui-slider-native') as HTMLInputElement;
    const fill = fixture.nativeElement.querySelector('.kui-slider-fill') as HTMLElement;

    expect(native.value).toBe('60');
    expect(fill.style.width).toBe('60%');

    native.value = '80';
    native.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.model().volume).toBe(80);
    expect(fill.style.width).toBe('80%');
  });

  it('reflects Signal Forms disabled state to the native range and generated wrapper', async () => {
    await TestBed.configureTestingModule({
      imports: [SignalFormsHostComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(SignalFormsHostComponent);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('.kui-slider-native') as HTMLInputElement;
    const container = fixture.nativeElement.querySelector('.kui-slider') as HTMLElement;

    expect(input.disabled).toBe(false);
    expect(container.hasAttribute('data-kui-disabled')).toBe(false);

    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    expect(input.disabled).toBe(true);
    expect(container.getAttribute('data-kui-disabled')).toBe('true');

    fixture.componentInstance.disabled.set(false);
    fixture.detectChanges();

    expect(input.disabled).toBe(false);
    expect(container.hasAttribute('data-kui-disabled')).toBe(false);
  });
});

describe('KuiSlider inside kui-field', () => {
  it('inherits field id, description, and invalid state', async () => {
    await TestBed.configureTestingModule({
      imports: [FieldWiringHostComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(FieldWiringHostComponent);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('.kui-slider-native') as HTMLInputElement;
    const container = fixture.nativeElement.querySelector('.kui-slider') as HTMLElement;

    expect(input.id).toMatch(/^kui-field-\d+$/);
    expect(input.getAttribute('aria-describedby')).toContain(`${input.id}-hint`);
    expect(input.getAttribute('aria-describedby')).toContain(`${input.id}-error`);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(container.hasAttribute('data-kui-invalid')).toBe(true);
  });
});
