import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { kuiProvideFieldOptions } from '../../tokens/kui-field-options.token';
import { KuiFieldComponent } from '../field/kui-field.component';
import { KuiComboboxComponent } from './kui-combobox.component';
import { KuiComboboxValueDirective } from './kui-combobox-value.directive';

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

@Component({
  template: `
    <kui-field label="Reviewers">
      <kui-combobox
        multiple
        [options]="options"
        [(value)]="value"
        [maxVisibleChips]="2"
        placeholder="Search..."
      />
      <ng-template kuiComboboxValue let-label="label" let-remove="remove">
        <span class="custom-combobox-value">
          custom:{{ label
          }}<button type="button" class="custom-combobox-remove" (click)="remove()">x</button>
        </span>
      </ng-template>
    </kui-field>
  `,
  imports: [KuiFieldComponent, KuiComboboxComponent, KuiComboboxValueDirective],
})
class TestComboboxTemplateHost {
  readonly options = ['Alpha', 'Beta', 'Gamma'];
  readonly value = signal<readonly string[]>(['Alpha', 'Beta', 'Gamma']);
}

@Component({
  template: `
    <kui-combobox multiple wrapChips [options]="options" [(value)]="value" [maxVisibleChips]="1" />
  `,
  imports: [KuiComboboxComponent],
})
class TestComboboxWrapHost {
  readonly options = ['Alpha', 'Beta', 'Gamma'];
  readonly value = signal<readonly string[]>(['Alpha', 'Beta', 'Gamma']);
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

  it('collapses multiple selected chips into an overflow chip', () => {
    fixture.componentInstance.multiple.set(true);
    fixture.componentInstance.value.set(['Alpha', 'Beta', 'Gamma', 'Delta']);
    fixture.detectChanges();

    const chips = host.querySelectorAll('[kuiChip]');

    expect(chips).toHaveLength(4);
    expect(chips[0].textContent).toContain('Alpha');
    expect(chips[1].textContent).toContain('Beta');
    expect(chips[2].textContent).toContain('Gamma');
    expect(chips[3].textContent).toContain('+1');
  });

  it('can opt into wrapping all selected chips instead of collapsed overflow', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({ imports: [TestComboboxWrapHost] })
      .compileComponents();

    const wrapFixture = TestBed.createComponent(TestComboboxWrapHost);
    wrapFixture.detectChanges();

    const wrapHost = wrapFixture.nativeElement as HTMLElement;
    const chips = wrapHost.querySelectorAll('[kuiChip]');

    expect(wrapHost.querySelector('kui-combobox')?.hasAttribute('data-kui-wrap-chips')).toBe(true);
    expect(chips).toHaveLength(3);
    expect(wrapHost.textContent).not.toContain('+2');
  });

  it('uses a custom selected value template when provided', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({ imports: [TestComboboxTemplateHost] })
      .compileComponents();

    const templateFixture = TestBed.createComponent(TestComboboxTemplateHost);
    templateFixture.detectChanges();

    const values = templateFixture.nativeElement.querySelectorAll('.custom-combobox-value');

    expect(values).toHaveLength(2);
    expect(values[0].textContent).toContain('custom:Alpha');
    expect(values[1].textContent).toContain('custom:Beta');
    expect(templateFixture.nativeElement.textContent).toContain('+1');
  });

  it('exposes a remove callback to the custom combobox value template', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({ imports: [TestComboboxTemplateHost] })
      .compileComponents();

    const templateFixture = TestBed.createComponent(TestComboboxTemplateHost);
    templateFixture.detectChanges();

    const remove = templateFixture.nativeElement.querySelector(
      '.custom-combobox-remove',
    ) as HTMLButtonElement;
    remove.click();
    templateFixture.detectChanges();

    expect(templateFixture.componentInstance.value()).toEqual(['Beta', 'Gamma']);
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
