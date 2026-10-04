import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { describe, expect, it } from 'vitest';

import { KuiCalendar } from '../calendar';
import { KuiDropdown } from '../dropdown';
import { KuiTimePickerPanel } from '../time-picker/kui-time-picker-panel.component';
import { KuiField } from './kui-field.component';
import {
  KUI_FIELD,
  KUI_FIELD_CALENDAR,
  KUI_FIELD_DROPDOWN,
  KUI_FIELD_TIME_PICKER_PANEL,
  type KuiFieldHost,
  type KuiFieldPart,
  registerKuiFieldPart,
} from './kui-field-host.token';

const TEST_PART: KuiFieldPart<{ readonly label: string }> = { name: 'test-part' };

@Component({
  selector: 'kui-test-part',
  template: '',
})
class TestPartComponent {
  readonly label = 'part';

  constructor() {
    registerKuiFieldPart(TEST_PART, this);
  }
}

@Component({
  imports: [KuiField, TestPartComponent],
  template: `
    <kui-field label="Parts">
      <input />
      @if (showFirst()) {
        <kui-test-part />
      }
      @if (showSecond()) {
        <kui-test-part />
      }
    </kui-field>
  `,
})
class PartsHost {
  readonly showFirst = signal(true);
  readonly showSecond = signal(false);
}

@Component({
  imports: [KuiField, KuiDropdown, KuiCalendar, KuiTimePickerPanel],
  template: `
    <kui-field label="Picker">
      <input />
      <kui-dropdown />
      <kui-calendar />
      <kui-time-picker-panel />
    </kui-field>
  `,
})
class PickerPartsHost {}

@Component({
  imports: [TestPartComponent],
  template: ` <kui-test-part /> `,
})
class StandalonePartHost {}

@Component({
  imports: [KuiField],
  template: `
    <kui-field label="Token">
      <input />
    </kui-field>
  `,
})
class TokenHost {}

describe('kui-field host contract', () => {
  it('provides the field through KUI_FIELD', () => {
    const fixture = TestBed.createComponent(TokenHost);
    fixture.detectChanges();

    const field = fixture.debugElement.children[0];
    const host: KuiFieldHost = field.injector.get(KUI_FIELD);

    expect(host).toBe(field.injector.get(KuiField));
    expect(host.controlId).toBe(field.componentInstance.controlId);
  });

  it('registers the dropdown, calendar and time picker panel of a field', () => {
    const fixture = TestBed.createComponent(PickerPartsHost);
    fixture.detectChanges();

    const field = fixture.debugElement.children[0].componentInstance as KuiField;
    const dropdown = fixture.debugElement.query(
      (el) => el.componentInstance instanceof KuiDropdown,
    );
    const calendar = fixture.debugElement.query(
      (el) => el.componentInstance instanceof KuiCalendar,
    );
    const panel = fixture.debugElement.query(
      (el) => el.componentInstance instanceof KuiTimePickerPanel,
    );

    expect(field.getDropdown()).toBe(dropdown.componentInstance);
    expect(field.getCalendar()).toBe(calendar.componentInstance);
    expect(field.getTimePickerPanel()).toBe(panel.componentInstance);
    expect(field.getPart(KUI_FIELD_DROPDOWN)).toBe(dropdown.componentInstance);
    expect(field.getPart(KUI_FIELD_CALENDAR)).toBe(calendar.componentInstance);
    expect(field.getPart(KUI_FIELD_TIME_PICKER_PANEL)).toBe(panel.componentInstance);
  });

  it('exposes the open state of a registered dropdown on the host', () => {
    const fixture = TestBed.createComponent(PickerPartsHost);
    fixture.detectChanges();

    const fieldElement = fixture.nativeElement.querySelector('kui-field') as HTMLElement;
    const dropdown = fixture.debugElement.query((el) => el.componentInstance instanceof KuiDropdown)
      .componentInstance as KuiDropdown;

    expect(fieldElement.hasAttribute('data-dropdown-open')).toBe(false);

    dropdown.isOpen.set(true);
    fixture.detectChanges();

    expect(fieldElement.hasAttribute('data-dropdown-open')).toBe(true);
  });

  it('unregisters a part when it is destroyed and falls back to the next one', () => {
    const fixture = TestBed.createComponent(PartsHost);
    fixture.componentInstance.showSecond.set(true);
    fixture.detectChanges();

    const field = fixture.debugElement.children[0].componentInstance as KuiField;
    const parts = fixture.debugElement.queryAll(
      (el) => el.componentInstance instanceof TestPartComponent,
    );

    expect(field.getPart(TEST_PART)).toBe(parts[0].componentInstance);

    fixture.componentInstance.showFirst.set(false);
    fixture.detectChanges();

    expect(field.getPart(TEST_PART)).toBe(parts[1].componentInstance);

    fixture.componentInstance.showSecond.set(false);
    fixture.detectChanges();

    expect(field.getPart(TEST_PART)).toBeUndefined();
  });

  it('does nothing when a part is used outside a field', () => {
    const fixture = TestBed.createComponent(StandalonePartHost);

    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
