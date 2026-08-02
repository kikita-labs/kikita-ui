import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { form, FormField, required } from '@angular/forms/signals';

import { describe, expect, it } from 'vitest';

import { provideKikitaUi } from '../../providers';
import { kuiProvideFieldOptions } from '../../tokens';
import { KuiInputDirective } from '../input';
import { KuiFieldComponent } from './kui-field.component';
import { KuiFieldActionDirective, KuiFieldAffixDirective } from './kui-field-affix.directive';
import {
  KuiErrorDirective,
  KuiHintDirective,
  KuiLabelDirective,
} from './kui-field-markers.directive';

@Component({
  imports: [KuiFieldComponent],
  template: `
    <kui-field label="Email" required>
      <input />
    </kui-field>
  `,
})
class StaticRequiredHost {}

@Component({
  imports: [FormField, KuiFieldComponent, KuiInputDirective],
  template: `
    <kui-field label="Email">
      <input kuiInput [formField]="profileForm.email" />
    </kui-field>
  `,
})
class SignalFormsRequiredHost {
  readonly model = signal({ email: '' });
  readonly profileForm = form(this.model, (path) => {
    required(path.email, { message: 'Email is required' });
  });
}

@Component({
  imports: [FormField, KuiFieldComponent, KuiInputDirective],
  template: `
    <kui-field label="Email" [required]="false">
      <input kuiInput [formField]="profileForm.email" />
    </kui-field>
  `,
})
class ExplicitRequiredFalseHost {
  readonly model = signal({ email: '' });
  readonly profileForm = form(this.model, (path) => {
    required(path.email, { message: 'Email is required' });
  });
}

@Component({
  imports: [FormField, KuiFieldComponent, KuiInputDirective],
  template: `
    <kui-field label="Email" hideErrors>
      <input kuiInput [formField]="profileForm.email" />
    </kui-field>
  `,
})
class HiddenSignalFormsErrorHost {
  readonly model = signal({ email: '' });
  readonly profileForm = form(this.model, (path) => {
    required(path.email, { message: 'Email is required' });
  });
}

@Component({
  imports: [KuiFieldComponent],
  template: `
    <kui-field label="Email" error="Email is required" hideErrors>
      <input />
    </kui-field>
  `,
})
class HiddenExplicitErrorHost {}

@Component({
  imports: [FormField, KuiFieldComponent, KuiInputDirective],
  template: `
    <kui-field label="Email">
      <input kuiInput [formField]="profileForm.email" />
    </kui-field>
  `,
})
class ProviderFieldOptionsHost {
  readonly model = signal({ email: '' });
  readonly profileForm = form(this.model, (path) => {
    required(path.email, { message: 'Email is required' });
  });
}

@Component({
  imports: [KuiFieldComponent],
  template: `
    <kui-field label="Email">
      <input />
    </kui-field>
  `,
})
class RootDefaultFieldHost {}

@Component({
  imports: [
    KuiErrorDirective,
    KuiFieldComponent,
    KuiHintDirective,
    KuiInputDirective,
    KuiLabelDirective,
  ],
  template: `
    <kui-field>
      <label kuiLabel>Email</label>
      <input kuiInput />
      <p kuiHint>Use your work email</p>
      <p kuiError>Email is required</p>
    </kui-field>
  `,
})
class ProjectedFieldContentHost {}

@Component({
  imports: [
    KuiErrorDirective,
    KuiFieldComponent,
    KuiHintDirective,
    KuiInputDirective,
    KuiLabelDirective,
  ],
  template: `
    <kui-field hideErrors>
      <label kuiLabel>Email</label>
      <input kuiInput />
      <p kuiHint>Use your work email</p>
      <p kuiError>Email is required</p>
    </kui-field>
  `,
})
class HiddenProjectedErrorHost {}

@Component({
  imports: [KuiFieldAffixDirective, KuiFieldComponent, KuiInputDirective],
  template: `
    <kui-field label="Project URL">
      <span kuiFieldAffix>https://</span>
      <input kuiInput />
    </kui-field>
  `,
})
class AffixContentHost {}

@Component({
  imports: [KuiFieldActionDirective, KuiFieldComponent, KuiInputDirective],
  template: `
    <kui-field label="Search">
      <input kuiInput />
      <button kuiFieldAction type="button" aria-label="Clear"></button>
    </kui-field>
  `,
})
class FieldActionContentHost {}

@Component({
  imports: [KuiFieldComponent, KuiInputDirective],
  template: `
    <kui-field label="No affixes">
      <input kuiInput />
    </kui-field>
  `,
})
class NoAffixContentHost {}

function requiredMarker(fixture: ComponentFixture<unknown>): HTMLElement | null {
  return fixture.nativeElement.querySelector('.kui-field__required');
}

function errorMessage(fixture: ComponentFixture<unknown>): HTMLElement | null {
  return fixture.nativeElement.querySelector('.kui-field__error');
}

describe('KuiFieldComponent', () => {
  it('shows the required marker when required is set explicitly', async () => {
    await TestBed.configureTestingModule({ imports: [StaticRequiredHost] }).compileComponents();
    const fixture = TestBed.createComponent(StaticRequiredHost);
    fixture.detectChanges();

    expect(requiredMarker(fixture)).not.toBeNull();
  });

  it('inherits the required marker from an Angular Signal Forms required validator', async () => {
    await TestBed.configureTestingModule({
      imports: [SignalFormsRequiredHost],
    }).compileComponents();
    const fixture = TestBed.createComponent(SignalFormsRequiredHost);
    fixture.detectChanges();

    expect(requiredMarker(fixture)).not.toBeNull();
  });

  it('renders the first Angular Signal Forms error message automatically', async () => {
    await TestBed.configureTestingModule({
      imports: [SignalFormsRequiredHost],
    }).compileComponents();
    const fixture = TestBed.createComponent(SignalFormsRequiredHost);
    fixture.detectChanges();

    expect(errorMessage(fixture)?.textContent?.trim()).toBe('Email is required');
  });

  it('can hide automatically rendered Angular Signal Forms error messages', async () => {
    await TestBed.configureTestingModule({
      imports: [HiddenSignalFormsErrorHost],
    }).compileComponents();
    const fixture = TestBed.createComponent(HiddenSignalFormsErrorHost);
    fixture.detectChanges();

    expect(errorMessage(fixture)).toBeNull();
    expect(fixture.nativeElement.querySelector('.kui-field').hasAttribute('data-kui-invalid')).toBe(
      true,
    );
  });

  it('can hide explicit error messages while keeping invalid state', async () => {
    await TestBed.configureTestingModule({
      imports: [HiddenExplicitErrorHost],
    }).compileComponents();
    const fixture = TestBed.createComponent(HiddenExplicitErrorHost);
    fixture.detectChanges();

    const field = fixture.nativeElement.querySelector('kui-field') as HTMLElement;

    expect(errorMessage(fixture)).toBeNull();
    expect(field.hasAttribute('data-kui-invalid')).toBe(true);
  });

  it('uses provider defaults for size and hidden automatic errors', async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderFieldOptionsHost],
      providers: [kuiProvideFieldOptions({ size: 'sm', hideErrors: true })],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProviderFieldOptionsHost);
    fixture.detectChanges();

    const field = fixture.nativeElement.querySelector('kui-field') as HTMLElement;

    expect(field.getAttribute('data-kui-size')).toBe('sm');
    expect(errorMessage(fixture)).toBeNull();
    expect(field.hasAttribute('data-kui-invalid')).toBe(true);
  });

  it('uses root size defaults when scoped field options omit size', async () => {
    await TestBed.configureTestingModule({
      imports: [RootDefaultFieldHost],
      providers: [provideKikitaUi({ defaults: { size: 'lg' } })],
    }).compileComponents();
    const fixture = TestBed.createComponent(RootDefaultFieldHost);
    fixture.detectChanges();

    const field = fixture.nativeElement.querySelector('kui-field') as HTMLElement;

    expect(field.getAttribute('data-kui-size')).toBe('lg');
  });

  it('lets explicit required false override an Angular Signal Forms required validator', async () => {
    await TestBed.configureTestingModule({
      imports: [ExplicitRequiredFalseHost],
    }).compileComponents();
    const fixture = TestBed.createComponent(ExplicitRequiredFalseHost);
    fixture.detectChanges();

    expect(requiredMarker(fixture)).toBeNull();
  });

  it('wires projected label, hint, and error content', async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectedFieldContentHost],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProjectedFieldContentHost);
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('label[kuiLabel]') as HTMLLabelElement;
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const hint = fixture.nativeElement.querySelector('[kuiHint]') as HTMLElement;
    const error = fixture.nativeElement.querySelector('[kuiError]') as HTMLElement;

    expect(label.getAttribute('for')).toBe(input.id);
    expect(input.getAttribute('aria-describedby')).toContain(hint.id);
    expect(input.getAttribute('aria-describedby')).toContain(error.id);
  });

  it('can hide projected error content while keeping invalid state', async () => {
    await TestBed.configureTestingModule({
      imports: [HiddenProjectedErrorHost],
    }).compileComponents();
    const fixture = TestBed.createComponent(HiddenProjectedErrorHost);
    fixture.detectChanges();

    const field = fixture.nativeElement.querySelector('kui-field') as HTMLElement;
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const hint = fixture.nativeElement.querySelector('[kuiHint]') as HTMLElement;

    expect(fixture.nativeElement.querySelector('[kuiError]')).toBeNull();
    expect(input.getAttribute('aria-describedby')).toContain(hint.id);
    expect(input.getAttribute('aria-describedby')).not.toContain('error');
    expect(field.hasAttribute('data-kui-invalid')).toBe(true);
  });

  it('auto-wraps the control slot in input-group chrome when a kuiFieldAffix is projected', async () => {
    await TestBed.configureTestingModule({ imports: [AffixContentHost] }).compileComponents();
    const fixture = TestBed.createComponent(AffixContentHost);
    fixture.detectChanges();

    const control = fixture.nativeElement.querySelector('.kui-field__control') as HTMLElement;

    expect(control.classList.contains('kui-input-group')).toBe(true);
  });

  it('auto-wraps the control slot in input-group chrome when a kuiFieldAction is projected', async () => {
    await TestBed.configureTestingModule({
      imports: [FieldActionContentHost],
    }).compileComponents();
    const fixture = TestBed.createComponent(FieldActionContentHost);
    fixture.detectChanges();

    const control = fixture.nativeElement.querySelector('.kui-field__control') as HTMLElement;

    expect(control.classList.contains('kui-input-group')).toBe(true);
  });

  it('does not add input-group chrome when no affix content is projected', async () => {
    await TestBed.configureTestingModule({ imports: [NoAffixContentHost] }).compileComponents();
    const fixture = TestBed.createComponent(NoAffixContentHost);
    fixture.detectChanges();

    const control = fixture.nativeElement.querySelector('.kui-field__control') as HTMLElement;

    expect(control.classList.contains('kui-input-group')).toBe(false);
  });
});
