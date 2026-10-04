import type { Type } from '@angular/core';
import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { form, FormField, required } from '@angular/forms/signals';

import { describe, expect, it } from 'vitest';

import { KuiCheckbox } from '../checkbox';
import { KuiColorInput } from '../color-input';
import { KuiCombobox } from '../combobox';
import { KuiDatePicker } from '../date-picker';
import { KuiDropdown, KuiOption } from '../dropdown';
import { KuiInput } from '../input';
import { KuiNumberInput } from '../number-input';
import { KuiRadio } from '../radio';
import { KuiSelect } from '../select';
import { KuiSlider } from '../slider';
import { KuiSwitch } from '../switch';
import { KuiTextarea } from '../textarea';
import { KuiTimePicker } from '../time-picker';
import { KuiField } from './kui-field.component';

/**
 * Characterization of the field wiring every form control shares: the host id, `aria-describedby`,
 * the touched gating of `aria-invalid` for a Signal Forms field, and `aria-required`. One host per
 * scenario renders every control in its own `kui-field`, so each rule is checked against all of them.
 */

const IMPORTS = [
  FormField,
  KuiField,
  KuiCheckbox,
  KuiColorInput,
  KuiCombobox,
  KuiDatePicker,
  KuiDropdown,
  KuiInput,
  KuiNumberInput,
  KuiOption,
  KuiRadio,
  KuiSelect,
  KuiSlider,
  KuiSwitch,
  KuiTextarea,
  KuiTimePicker,
];

interface WiringModel {
  input: string;
  textarea: string;
  checkbox: boolean;
  radio: string;
  switch: boolean;
  number: number | null;
  color: string;
  slider: number;
  select: string;
  combobox: string;
  datePicker: Date | null;
  timePicker: Date | null;
}

function emptyModel(): WiringModel {
  return {
    input: '',
    textarea: '',
    checkbox: false,
    radio: '',
    switch: false,
    number: null,
    color: '',
    slider: 0,
    select: '',
    combobox: '',
    datePicker: null,
    timePicker: null,
  };
}

const CONTROLS = [
  { name: 'input', key: 'input', canBeInvalid: true, supportsAriaRequired: true },
  { name: 'textarea', key: 'textarea', canBeInvalid: true, supportsAriaRequired: true },
  { name: 'checkbox', key: 'checkbox', canBeInvalid: true, supportsAriaRequired: true },
  { name: 'radio', key: 'radio', canBeInvalid: true, supportsAriaRequired: false },
  { name: 'switch', key: 'switch', canBeInvalid: true, supportsAriaRequired: true },
  { name: 'number', key: 'number', canBeInvalid: true, supportsAriaRequired: true },
  { name: 'color', key: 'color', canBeInvalid: true, supportsAriaRequired: true },
  // A number always has a value, so `required` never fails on it.
  { name: 'slider', key: 'slider', canBeInvalid: false, supportsAriaRequired: false },
  { name: 'select', key: 'select', canBeInvalid: true, supportsAriaRequired: true },
  { name: 'combobox', key: 'combobox', canBeInvalid: true, supportsAriaRequired: true },
  { name: 'date picker', key: 'datePicker', canBeInvalid: true, supportsAriaRequired: true },
  { name: 'time picker', key: 'timePicker', canBeInvalid: true, supportsAriaRequired: true },
] as const;

type ControlKey = (typeof CONTROLS)[number]['key'];

interface WiringHost {
  readonly f: Record<ControlKey, () => { markAsTouched(): void }>;
}

function validatedForm(model: ReturnType<typeof signal<WiringModel>>) {
  return form(model, (path) => {
    required(path.input);
    required(path.textarea);
    required(path.checkbox);
    required(path.radio);
    required(path.switch);
    required(path.number);
    required(path.color);
    required(path.select);
    required(path.combobox);
    required(path.datePicker);
    required(path.timePicker);
  });
}

@Component({
  imports: IMPORTS,
  host: { 'data-scenario': 'ValidatedHost' },
  template: `
    <kui-field label="input" hint="Hint">
      <input kuiInput data-control="input" [formField]="f.input" />
    </kui-field>
    <kui-field label="textarea" hint="Hint">
      <textarea kuiTextarea data-control="textarea" [formField]="f.textarea"></textarea>
    </kui-field>
    <kui-field label="checkbox" hint="Hint">
      <input type="checkbox" kuiCheckbox data-control="checkbox" [formField]="f.checkbox" />
    </kui-field>
    <kui-field label="radio" hint="Hint">
      <input type="radio" kuiRadio data-control="radio" value="a" [formField]="f.radio" />
    </kui-field>
    <kui-field label="switch" hint="Hint">
      <input type="checkbox" kuiSwitch data-control="switch" [formField]="f.switch" />
    </kui-field>
    <kui-field label="number" hint="Hint">
      <input type="number" kuiNumberInput data-control="number" [formField]="f.number" />
    </kui-field>
    <kui-field label="color" hint="Hint">
      <input kuiColorInput data-control="color" [formField]="f.color" />
    </kui-field>
    <kui-field label="slider" hint="Hint">
      <input type="range" kuiSlider data-control="slider" [formField]="f.slider" />
    </kui-field>
    <kui-field label="select" hint="Hint">
      <input kuiSelect data-control="select" [formField]="f.select" /><kui-dropdown
        ><div kuiOption value="a">A</div></kui-dropdown
      >
    </kui-field>
    <kui-field label="combobox" hint="Hint">
      <input kuiCombobox data-control="combobox" [formField]="f.combobox" /><kui-dropdown
        ><div kuiOption value="a">A</div></kui-dropdown
      >
    </kui-field>
    <kui-field label="date picker" hint="Hint">
      <input kuiDatePicker data-control="date picker" [formField]="f.datePicker" />
    </kui-field>
    <kui-field label="time picker" hint="Hint">
      <input kuiTimePicker data-control="time picker" [formField]="f.timePicker" />
    </kui-field>
  `,
})
class ValidatedHost implements WiringHost {
  readonly model = signal(emptyModel());
  readonly f = validatedForm(this.model);
}

@Component({
  imports: IMPORTS,
  host: { 'data-scenario': 'ExplicitIdHost' },
  template: `
    <kui-field label="input" hint="Hint">
      <input kuiInput data-control="input" id="custom-input" [formField]="f.input" />
    </kui-field>
    <kui-field label="textarea" hint="Hint">
      <textarea
        kuiTextarea
        data-control="textarea"
        id="custom-textarea"
        [formField]="f.textarea"
      ></textarea>
    </kui-field>
    <kui-field label="checkbox" hint="Hint">
      <input
        type="checkbox"
        kuiCheckbox
        data-control="checkbox"
        id="custom-checkbox"
        [formField]="f.checkbox"
      />
    </kui-field>
    <kui-field label="radio" hint="Hint">
      <input
        type="radio"
        kuiRadio
        data-control="radio"
        id="custom-radio"
        value="a"
        [formField]="f.radio"
      />
    </kui-field>
    <kui-field label="switch" hint="Hint">
      <input
        type="checkbox"
        kuiSwitch
        data-control="switch"
        id="custom-switch"
        [formField]="f.switch"
      />
    </kui-field>
    <kui-field label="number" hint="Hint">
      <input
        type="number"
        kuiNumberInput
        data-control="number"
        id="custom-number"
        [formField]="f.number"
      />
    </kui-field>
    <kui-field label="color" hint="Hint">
      <input kuiColorInput data-control="color" id="custom-color" [formField]="f.color" />
    </kui-field>
    <kui-field label="slider" hint="Hint">
      <input
        type="range"
        kuiSlider
        data-control="slider"
        id="custom-slider"
        [formField]="f.slider"
      />
    </kui-field>
    <kui-field label="select" hint="Hint">
      <input
        kuiSelect
        data-control="select"
        id="custom-select"
        [formField]="f.select"
      /><kui-dropdown><div kuiOption value="a">A</div></kui-dropdown>
    </kui-field>
    <kui-field label="combobox" hint="Hint">
      <input
        kuiCombobox
        data-control="combobox"
        id="custom-combobox"
        [formField]="f.combobox"
      /><kui-dropdown><div kuiOption value="a">A</div></kui-dropdown>
    </kui-field>
    <kui-field label="date picker" hint="Hint">
      <input
        kuiDatePicker
        data-control="date picker"
        id="custom-date-picker"
        [formField]="f.datePicker"
      />
    </kui-field>
    <kui-field label="time picker" hint="Hint">
      <input
        kuiTimePicker
        data-control="time picker"
        id="custom-time-picker"
        [formField]="f.timePicker"
      />
    </kui-field>
  `,
})
class ExplicitIdHost implements WiringHost {
  readonly model = signal(emptyModel());
  readonly f = validatedForm(this.model);
}

@Component({
  imports: IMPORTS,
  host: { 'data-scenario': 'ExplicitRequiredHost' },
  template: `
    <kui-field label="input" hint="Hint" required>
      <input kuiInput data-control="input" [formField]="f.input" />
    </kui-field>
    <kui-field label="textarea" hint="Hint" required>
      <textarea kuiTextarea data-control="textarea" [formField]="f.textarea"></textarea>
    </kui-field>
    <kui-field label="checkbox" hint="Hint" required>
      <input type="checkbox" kuiCheckbox data-control="checkbox" [formField]="f.checkbox" />
    </kui-field>
    <kui-field label="radio" hint="Hint" required>
      <input type="radio" kuiRadio data-control="radio" value="a" [formField]="f.radio" />
    </kui-field>
    <kui-field label="switch" hint="Hint" required>
      <input type="checkbox" kuiSwitch data-control="switch" [formField]="f.switch" />
    </kui-field>
    <kui-field label="number" hint="Hint" required>
      <input type="number" kuiNumberInput data-control="number" [formField]="f.number" />
    </kui-field>
    <kui-field label="color" hint="Hint" required>
      <input kuiColorInput data-control="color" [formField]="f.color" />
    </kui-field>
    <kui-field label="slider" hint="Hint" required>
      <input type="range" kuiSlider data-control="slider" [formField]="f.slider" />
    </kui-field>
    <kui-field label="select" hint="Hint" required>
      <input kuiSelect data-control="select" [formField]="f.select" /><kui-dropdown
        ><div kuiOption value="a">A</div></kui-dropdown
      >
    </kui-field>
    <kui-field label="combobox" hint="Hint" required>
      <input kuiCombobox data-control="combobox" [formField]="f.combobox" /><kui-dropdown
        ><div kuiOption value="a">A</div></kui-dropdown
      >
    </kui-field>
    <kui-field label="date picker" hint="Hint" required>
      <input kuiDatePicker data-control="date picker" [formField]="f.datePicker" />
    </kui-field>
    <kui-field label="time picker" hint="Hint" required>
      <input kuiTimePicker data-control="time picker" [formField]="f.timePicker" />
    </kui-field>
  `,
})
class ExplicitRequiredHost implements WiringHost {
  readonly model = signal(emptyModel());
  readonly f = form(this.model);
}

@Component({
  imports: IMPORTS,
  host: { 'data-scenario': 'PlainHost' },
  template: `
    <kui-field label="input" hint="Hint">
      <input kuiInput data-control="input" [formField]="f.input" />
    </kui-field>
    <kui-field label="textarea" hint="Hint">
      <textarea kuiTextarea data-control="textarea" [formField]="f.textarea"></textarea>
    </kui-field>
    <kui-field label="checkbox" hint="Hint">
      <input type="checkbox" kuiCheckbox data-control="checkbox" [formField]="f.checkbox" />
    </kui-field>
    <kui-field label="radio" hint="Hint">
      <input type="radio" kuiRadio data-control="radio" value="a" [formField]="f.radio" />
    </kui-field>
    <kui-field label="switch" hint="Hint">
      <input type="checkbox" kuiSwitch data-control="switch" [formField]="f.switch" />
    </kui-field>
    <kui-field label="number" hint="Hint">
      <input type="number" kuiNumberInput data-control="number" [formField]="f.number" />
    </kui-field>
    <kui-field label="color" hint="Hint">
      <input kuiColorInput data-control="color" [formField]="f.color" />
    </kui-field>
    <kui-field label="slider" hint="Hint">
      <input type="range" kuiSlider data-control="slider" [formField]="f.slider" />
    </kui-field>
    <kui-field label="select" hint="Hint">
      <input kuiSelect data-control="select" [formField]="f.select" /><kui-dropdown
        ><div kuiOption value="a">A</div></kui-dropdown
      >
    </kui-field>
    <kui-field label="combobox" hint="Hint">
      <input kuiCombobox data-control="combobox" [formField]="f.combobox" /><kui-dropdown
        ><div kuiOption value="a">A</div></kui-dropdown
      >
    </kui-field>
    <kui-field label="date picker" hint="Hint">
      <input kuiDatePicker data-control="date picker" [formField]="f.datePicker" />
    </kui-field>
    <kui-field label="time picker" hint="Hint">
      <input kuiTimePicker data-control="time picker" [formField]="f.timePicker" />
    </kui-field>
  `,
})
class PlainHost implements WiringHost {
  readonly model = signal(emptyModel());
  readonly f = form(this.model);
}

function controlOf(fixture: ComponentFixture<unknown>, name: string): HTMLElement {
  return fixture.nativeElement.querySelector(`[data-control="${name}"]`) as HTMLElement;
}

async function render<T extends WiringHost>(host: Type<T>): Promise<ComponentFixture<T>> {
  const fixture = TestBed.createComponent(host);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

describe('field control wiring', () => {
  describe.each(CONTROLS)('$name', ({ name, key, canBeInvalid, supportsAriaRequired }) => {
    it('points the field label at the control id', async () => {
      const fixture = await render(ValidatedHost);
      const control = controlOf(fixture, name);
      const label = control.closest('kui-field')?.querySelector('label') as HTMLLabelElement;

      expect(control.id).toBeTruthy();
      expect(label.htmlFor).toBe(control.id);
    });

    it('lets an explicit id win over the field id', async () => {
      const fixture = await render(ExplicitIdHost);

      expect(controlOf(fixture, name).id).toBe(`custom-${name.replace(' ', '-')}`);
    });

    it('describes the control by the field hint', async () => {
      const fixture = await render(ValidatedHost);
      const control = controlOf(fixture, name);
      const hint = control.closest('kui-field')?.querySelector('.kui-field__hint') as HTMLElement;

      expect(hint.id).toBeTruthy();
      expect(control.getAttribute('aria-describedby')).toContain(hint.id);
    });

    const expectedRequired = supportsAriaRequired ? 'true' : null;

    it('exposes aria-required when the field is marked required without a validator', async () => {
      const fixture = await render(ExplicitRequiredHost);

      expect(controlOf(fixture, name).getAttribute('aria-required')).toBe(expectedRequired);
    });

    it('exposes aria-required when the Signal Forms validator makes the field required', async () => {
      const fixture = await render(ValidatedHost);

      expect(controlOf(fixture, name).getAttribute('aria-required')).toBe(expectedRequired);
    });

    it('has no aria-required when the field is not required', async () => {
      const fixture = await render(PlainHost);

      expect(controlOf(fixture, name).getAttribute('aria-required')).toBeNull();
    });

    if (canBeInvalid) {
      it('is not invalid for assistive technology before the field is touched', async () => {
        const fixture = await render(ValidatedHost);

        expect(controlOf(fixture, name).getAttribute('aria-invalid')).toBeNull();
      });

      it('becomes invalid once the Signal Forms field is touched', async () => {
        const fixture = await render(ValidatedHost);

        fixture.componentInstance.f[key]().markAsTouched();
        fixture.detectChanges();

        expect(controlOf(fixture, name).getAttribute('aria-invalid')).toBe('true');
      });
    }
  });
});
