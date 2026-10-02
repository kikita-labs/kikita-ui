import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { KuiButtonDirective } from '../components/button';
import { KuiCalendarComponent } from '../components/calendar';
import { KuiDatePickerDirective } from '../components/date-picker';
import { KuiDropdownComponent } from '../components/dropdown';
import { KuiFieldComponent } from '../components/field';
import { KuiDefaults } from './kui-defaults.service';
import { provideKikitaUi } from './provide-kikita-ui';
import { kuiProvideDefaults } from './provide-kui-defaults';

@Component({
  imports: [KuiButtonDirective],
  template: `<button kuiButton>Save</button>`,
})
class ButtonHost {}

@Component({
  imports: [KuiButtonDirective],
  providers: [kuiProvideDefaults({ button: { size: 'lg' } })],
  template: `<button kuiButton>Scoped</button>`,
})
class ScopedButtonHost {}

@Component({
  imports: [KuiFieldComponent, KuiDropdownComponent, KuiDatePickerDirective, KuiCalendarComponent],
  template: `
    <kui-field label="Date">
      <input kuiDatePicker [value]="value()" />
      <kui-dropdown panelRole="dialog" panelWidth="auto">
        <kui-calendar flat />
      </kui-dropdown>
    </kui-field>
  `,
})
class DatePickerHost {
  readonly value = signal<Date | null>(new Date(2026, 6, 17));
}

describe('KuiDefaults read by components', () => {
  afterEach(() => TestBed.resetTestingModule());

  function render<T>(type: new () => T): HTMLElement {
    const fixture = TestBed.createComponent(type);
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it('updates a rendered button when a default changes at runtime', () => {
    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ defaults: { button: { shape: 'ghost' } } })],
    });

    const fixture = TestBed.createComponent(ButtonHost);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;

    expect(button.getAttribute('data-kui-shape')).toBe('ghost');

    TestBed.inject(KuiDefaults).set('button', { shape: 'outline' });
    fixture.detectChanges();

    expect(button.getAttribute('data-kui-shape')).toBe('outline');
  });

  it('follows a signal passed as a default', () => {
    const size = signal<'sm' | 'lg'>('sm');

    TestBed.configureTestingModule({ providers: [provideKikitaUi({ defaults: { size } })] });

    const fixture = TestBed.createComponent(ButtonHost);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;

    expect(button.getAttribute('data-kui-size')).toBe('sm');

    size.set('lg');
    fixture.detectChanges();

    expect(button.getAttribute('data-kui-size')).toBe('lg');
  });

  it('applies a nested level from component providers over the root without losing siblings', () => {
    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ defaults: { button: { shape: 'ghost', size: 'sm' } } })],
    });

    const button = render(ScopedButtonHost).querySelector('button')!;

    expect(button.getAttribute('data-kui-size')).toBe('lg');
    expect(button.getAttribute('data-kui-shape')).toBe('ghost');
  });

  it('keeps the deprecated root tooltip option working next to the new defaults key', () => {
    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ tooltip: { triggerType: 'hover' }, defaults: { size: 'sm' } })],
    });

    expect(TestBed.inject(KuiDefaults).effective()).toEqual({
      size: 'sm',
      tooltip: { triggerType: 'hover' },
    });
  });

  describe('date picker clearable', () => {
    it('uses the field default when no date picker default is set', () => {
      TestBed.configureTestingModule({
        providers: [provideKikitaUi({ defaults: { field: { clearable: false } } })],
      });

      expect(render(DatePickerHost).querySelector('.kui-date-picker-clear')).toBeNull();
    });

    it('lets the datePicker key win over the field key', () => {
      TestBed.configureTestingModule({
        providers: [
          provideKikitaUi({
            defaults: { field: { clearable: false }, datePicker: { clearable: true } },
          }),
        ],
      });

      expect(render(DatePickerHost).querySelector('.kui-date-picker-clear')).not.toBeNull();
    });
  });
});
