import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { kuiProvideFieldOptions } from '../../tokens/kui-field-options.token';
import { KuiFieldComponent } from '../field/kui-field.component';
import { KuiComboboxComponent } from './kui-combobox.component';

@Component({
  template: `
    <kui-combobox
      [options]="options"
      [(value)]="value"
      [multiple]="multiple()"
      placeholder="Search..."
    />
  `,
  imports: [KuiComboboxComponent],
})
class TestComboboxHost {
  readonly options = ['Alpha', 'Beta', 'Gamma'];
  readonly value = signal<string | readonly string[] | null>(null);
  readonly multiple = signal(false);
}

@Component({
  template: `
    <kui-field label="Assignee" hint="Pick one" size="lg">
      <kui-combobox [options]="options" />
    </kui-field>
  `,
  imports: [KuiFieldComponent, KuiComboboxComponent],
})
class TestComboboxFieldHost {
  readonly options = ['Alpha', 'Beta'];
}

describe('KuiComboboxComponent', () => {
  let fixture: ComponentFixture<TestComboboxHost>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComboboxHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComboboxHost);
    host = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('filters options and selects a single value', () => {
    const input = host.querySelector('input') as HTMLInputElement;

    input.focus();
    input.value = 'be';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const option = host.querySelector('.kui-combobox-option') as HTMLButtonElement;
    expect(option.textContent?.trim()).toBe('Beta');

    option.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe('Beta');
  });

  it('reopens on click after selecting while focus stays on the input', () => {
    const input = host.querySelector('input') as HTMLInputElement;

    input.focus();
    fixture.detectChanges();

    const option = host.querySelector('.kui-combobox-option') as HTMLButtonElement;
    option.click();
    fixture.detectChanges();

    expect(host.querySelector('.kui-combobox-list')).toBeNull();

    input.click();
    fixture.detectChanges();

    expect(host.querySelector('.kui-combobox-list')).toBeTruthy();
  });

  it('focuses the input and opens when clicking the suffix area', () => {
    const input = host.querySelector('input') as HTMLInputElement;
    const suffix = host.querySelector('.kui-combobox-suffix') as HTMLElement;

    suffix.click();
    fixture.detectChanges();

    expect(document.activeElement).toBe(input);
    expect(host.querySelector('.kui-combobox-list')).toBeTruthy();
  });

  it('toggles the list from the chevron affordance', () => {
    const input = host.querySelector('input') as HTMLInputElement;
    const chevron = host.querySelector('.kui-combobox-chevron') as HTMLButtonElement;

    chevron.click();
    fixture.detectChanges();

    expect(document.activeElement).toBe(input);
    expect(chevron.getAttribute('aria-expanded')).toBe('true');
    expect(host.querySelector('.kui-combobox-list')).toBeTruthy();

    chevron.click();
    fixture.detectChanges();

    expect(chevron.getAttribute('aria-expanded')).toBe('false');
    expect(host.querySelector('.kui-combobox-list')).toBeNull();
  });

  it('clears the selected value when the single filter text is edited away', () => {
    const input = host.querySelector('input') as HTMLInputElement;

    input.focus();
    fixture.detectChanges();

    const option = host.querySelector('.kui-combobox-option') as HTMLButtonElement;
    option.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe('Alpha');

    input.value = '';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBeNull();
  });

  it('toggles multiple selected values', () => {
    fixture.componentInstance.multiple.set(true);
    fixture.detectChanges();

    const input = host.querySelector('input') as HTMLInputElement;
    input.focus();
    fixture.detectChanges();

    const options = host.querySelectorAll<HTMLButtonElement>('.kui-combobox-option');
    options[0].click();
    options[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toEqual(['Alpha', 'Beta']);
  });

  it('uses kui-field id, description, invalid state, size, and clearable defaults', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [TestComboboxFieldHost],
        providers: [kuiProvideFieldOptions({ clearable: false })],
      })
      .compileComponents();

    const fieldFixture = TestBed.createComponent(TestComboboxFieldHost);
    fieldFixture.detectChanges();

    const fieldHost = fieldFixture.nativeElement as HTMLElement;
    const field = fieldHost.querySelector('kui-field') as HTMLElement;
    const combobox = fieldHost.querySelector('kui-combobox') as HTMLElement;
    const input = fieldHost.querySelector('input') as HTMLInputElement;

    expect(combobox.getAttribute('data-kui-size')).toBe('lg');
    expect(input.id).toBe(field.querySelector('label')?.getAttribute('for'));
    expect(input.getAttribute('aria-describedby')).toContain('-hint');

    input.focus();
    fieldFixture.detectChanges();
    const option = fieldHost.querySelector('.kui-combobox-option') as HTMLButtonElement;
    option.click();
    fieldFixture.detectChanges();

    expect(fieldHost.querySelector('.kui-combobox-clear')).toBeNull();
  });
});
