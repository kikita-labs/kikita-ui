import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { KuiCheckbox } from '../components/checkbox/kui-checkbox';
import { KuiColorInput } from '../components/color-input/kui-color-input';
import { KuiField } from '../components/field/kui-field';
import { KuiInput } from '../components/input/kui-input';
import { KuiNumberInput } from '../components/number-input/kui-number-input';
import { KuiRadio } from '../components/radio/kui-radio';
import { KuiSlider } from '../components/slider/kui-slider';
import { KuiSwitch } from '../components/switch/kui-switch';
import { KuiTextarea } from '../components/textarea/kui-textarea';
import { provideKikitaUi } from '../root';
import { KuiDefaults } from './kui-defaults';

@Component({
  imports: [
    KuiField,
    KuiInput,
    KuiTextarea,
    KuiCheckbox,
    KuiRadio,
    KuiSwitch,
    KuiColorInput,
    KuiNumberInput,
    KuiSlider,
  ],
  template: `
    <input id="input-plain" kuiInput />
    <input id="input-local" kuiInput size="lg" />
    <kui-field label="a" size="lg"><input id="input-field" kuiInput /></kui-field>

    <textarea id="textarea-plain" kuiTextarea></textarea>
    <textarea id="textarea-local" kuiTextarea size="lg"></textarea>
    <kui-field label="a" size="lg"><textarea id="textarea-field" kuiTextarea></textarea></kui-field>

    <input id="checkbox-plain" type="checkbox" kuiCheckbox />
    <input id="checkbox-local" type="checkbox" kuiCheckbox size="lg" />
    <kui-field label="a" size="lg"
      ><input id="checkbox-field" type="checkbox" kuiCheckbox
    /></kui-field>

    <input id="radio-plain" type="radio" kuiRadio />
    <input id="radio-local" type="radio" kuiRadio size="lg" />
    <kui-field label="a" size="lg"><input id="radio-field" type="radio" kuiRadio /></kui-field>

    <input id="switch-plain" type="checkbox" kuiSwitch />
    <input id="switch-local" type="checkbox" kuiSwitch size="lg" />
    <kui-field label="a" size="lg"><input id="switch-field" type="checkbox" kuiSwitch /></kui-field>

    <input id="colorInput-plain" kuiColorInput value="#5b4fe0" />
    <input id="colorInput-local" kuiColorInput value="#5b4fe0" size="lg" />
    <kui-field label="a" size="lg"
      ><input id="colorInput-field" kuiColorInput value="#5b4fe0"
    /></kui-field>

    <input id="numberInput-plain" type="number" kuiNumberInput value="5" />
    <input
      id="numberInput-local"
      type="number"
      kuiNumberInput
      value="5"
      size="lg"
      variant="split"
    />
    <kui-field label="a" size="lg"
      ><input id="numberInput-field" type="number" kuiNumberInput value="5"
    /></kui-field>

    <input id="slider-plain" type="range" kuiSlider />
    <input id="slider-local" type="range" kuiSlider size="lg" color="danger" />
    <kui-field label="a" size="lg"><input id="slider-field" type="range" kuiSlider /></kui-field>
  `,
})
class FieldControlsHost {}

@Component({
  imports: [
    KuiField,
    KuiInput,
    KuiTextarea,
    KuiCheckbox,
    KuiRadio,
    KuiSwitch,
    KuiColorInput,
    KuiNumberInput,
  ],
  template: `
    <kui-field label="a"><input id="input-fd" kuiInput /></kui-field>
    <kui-field label="a"><textarea id="textarea-fd" kuiTextarea></textarea></kui-field>
    <kui-field label="a"><input id="checkbox-fd" type="checkbox" kuiCheckbox /></kui-field>
    <kui-field label="a"><input id="radio-fd" type="radio" kuiRadio /></kui-field>
    <kui-field label="a"><input id="switch-fd" type="checkbox" kuiSwitch /></kui-field>
    <kui-field label="a"><input id="colorInput-fd" kuiColorInput value="#5b4fe0" /></kui-field>
    <kui-field label="a"
      ><input id="numberInput-fd" type="number" kuiNumberInput value="5"
    /></kui-field>
  `,
})
class FieldDefaultsHost {}

function render(): HTMLElement {
  const fixture = TestBed.createComponent(FieldControlsHost);
  fixture.detectChanges();

  return fixture.nativeElement as HTMLElement;
}

function rerender(): { host: HTMLElement; detect: () => void } {
  const fixture = TestBed.createComponent(FieldControlsHost);
  fixture.detectChanges();

  return { host: fixture.nativeElement as HTMLElement, detect: () => fixture.detectChanges() };
}

/** Returns the element carrying `data-kui-size` for a control, which may be a generated wrapper. */
function sizeOf(host: HTMLElement, id: string): string | null {
  const el = host.querySelector(`#${id}`)!;
  const wrapper = el.closest('.kui-color-input, .kui-number-input, .kui-slider') ?? el;

  return wrapper.getAttribute('data-kui-size');
}

type FieldKey =
  | 'input'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'colorInput'
  | 'numberInput'
  | 'slider';

const KEYS: readonly FieldKey[] = [
  'input',
  'textarea',
  'checkbox',
  'radio',
  'switch',
  'colorInput',
  'numberInput',
  'slider',
];

describe('KuiDefaults key against a field size that comes from the defaults', () => {
  afterEach(() => TestBed.resetTestingModule());

  const NON_SLIDER = KEYS.filter((key) => key !== 'slider');

  for (const key of NON_SLIDER) {
    it(`${key}: the key wins over defaults.field.size, and defaults.field.size wins over the global size`, () => {
      TestBed.configureTestingModule({
        providers: [
          provideKikitaUi({
            defaults: { size: 'xs', field: { size: 'lg' }, [key]: { size: 'sm' } },
          }),
        ],
      });

      const fixture = TestBed.createComponent(FieldDefaultsHost);
      fixture.detectChanges();
      const host = fixture.nativeElement as HTMLElement;

      expect(sizeOf(host, `${key}-fd`)).toBe('sm');

      TestBed.inject(KuiDefaults).set(key, { size: undefined });
      fixture.detectChanges();

      expect(sizeOf(host, `${key}-fd`)).toBe('lg');
    });
  }
});

describe('KuiDefaults read by field controls', () => {
  afterEach(() => TestBed.resetTestingModule());

  for (const key of KEYS) {
    // The slider never read the parent field size, so its control case stays at the built-in size.
    const fieldFollowedWithoutKey = key === 'slider' ? 'md' : 'lg';

    describe(key, () => {
      it('keeps the built-in size without defaults', () => {
        TestBed.configureTestingModule({ providers: [provideKikitaUi()] });

        const host = render();

        expect(sizeOf(host, `${key}-plain`)).toBe('md');
        expect(sizeOf(host, `${key}-local`)).toBe('lg');
        expect(sizeOf(host, `${key}-field`)).toBe(fieldFollowedWithoutKey);
      });

      it('applies the key size outside a field (c3) and lets a local size win', () => {
        TestBed.configureTestingModule({
          providers: [provideKikitaUi({ defaults: { [key]: { size: 'sm' } } })],
        });

        const host = render();

        expect(sizeOf(host, `${key}-plain`)).toBe('sm');
        expect(sizeOf(host, `${key}-local`)).toBe('lg');
      });

      it('lets an explicit size of the parent field win over the key (c2)', () => {
        TestBed.configureTestingModule({
          providers: [provideKikitaUi({ defaults: { [key]: { size: 'sm' } } })],
        });

        const host = render();

        // The slider never read the parent field, so only its key applies.
        expect(sizeOf(host, `${key}-field`)).toBe(key === 'slider' ? 'sm' : 'lg');
      });

      it('follows a runtime change of the key size', () => {
        TestBed.configureTestingModule({
          providers: [provideKikitaUi({ defaults: { [key]: { size: 'sm' } } })],
        });

        const { host, detect } = rerender();

        expect(sizeOf(host, `${key}-plain`)).toBe('sm');

        TestBed.inject(KuiDefaults).set(key, { size: 'lg' });
        detect();

        expect(sizeOf(host, `${key}-plain`)).toBe('lg');
        expect(sizeOf(host, `${key}-local`)).toBe('lg');
      });
    });
  }

  it('prefers the key size over the global size default', () => {
    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ defaults: { size: 'lg', input: { size: 'sm' } } })],
    });

    const host = render();

    expect(sizeOf(host, 'input-plain')).toBe('sm');
    expect(sizeOf(host, 'textarea-plain')).toBe('lg');
  });

  describe('numberInput variant', () => {
    it('renders the split layout without defaults', () => {
      TestBed.configureTestingModule({ providers: [provideKikitaUi()] });

      const host = render();
      const plain = host.querySelector('#numberInput-plain')!.closest('.kui-number-input')!;

      expect(plain.classList.contains('kui-number-input--stacked')).toBe(false);
      expect(plain.querySelector('.kui-number-input__btn--dec')).not.toBeNull();
      expect(plain.querySelector('.kui-number-input__arrows')).toBeNull();
    });

    it('applies the default variant and lets a local variant win', () => {
      TestBed.configureTestingModule({
        providers: [provideKikitaUi({ defaults: { numberInput: { variant: 'stacked' } } })],
      });

      const host = render();
      const plain = host.querySelector('#numberInput-plain')!.closest('.kui-number-input')!;
      const local = host.querySelector('#numberInput-local')!.closest('.kui-number-input')!;

      expect(plain.classList.contains('kui-number-input--stacked')).toBe(true);
      expect(plain.querySelector('.kui-number-input__arrows')).not.toBeNull();
      expect(plain.querySelector('.kui-number-input__btn--dec')).toBeNull();
      expect(local.classList.contains('kui-number-input--stacked')).toBe(false);
      expect(local.querySelector('.kui-number-input__btn--dec')).not.toBeNull();
    });

    it('applies a variant set at runtime before the control is created', () => {
      TestBed.configureTestingModule({ providers: [provideKikitaUi()] });
      TestBed.inject(KuiDefaults).set('numberInput', { variant: 'stacked' });

      const host = render();
      const plain = host.querySelector('#numberInput-plain')!.closest('.kui-number-input')!;

      expect(plain.classList.contains('kui-number-input--stacked')).toBe(true);
    });
  });

  describe('slider color', () => {
    it('renders the primary colour without defaults', () => {
      TestBed.configureTestingModule({ providers: [provideKikitaUi()] });

      const host = render();
      const plain = host.querySelector('#slider-plain')!.closest('.kui-slider')!;

      expect(plain.getAttribute('data-kui-color')).toBe('primary');
    });

    it('applies the default colour and lets a local colour win', () => {
      TestBed.configureTestingModule({
        providers: [provideKikitaUi({ defaults: { slider: { color: 'success' } } })],
      });

      const host = render();
      const plain = host.querySelector('#slider-plain')!.closest('.kui-slider')!;
      const local = host.querySelector('#slider-local')!.closest('.kui-slider')!;

      expect(plain.getAttribute('data-kui-color')).toBe('success');
      expect(local.getAttribute('data-kui-color')).toBe('danger');
    });

    it('follows a runtime change of the default colour', () => {
      TestBed.configureTestingModule({
        providers: [provideKikitaUi({ defaults: { slider: { color: 'success' } } })],
      });

      const { host, detect } = rerender();
      const plain = host.querySelector('#slider-plain')!.closest('.kui-slider')!;

      expect(plain.getAttribute('data-kui-color')).toBe('success');

      TestBed.inject(KuiDefaults).set('slider', { color: 'neutral' });
      detect();

      expect(plain.getAttribute('data-kui-color')).toBe('neutral');
    });
  });
});
