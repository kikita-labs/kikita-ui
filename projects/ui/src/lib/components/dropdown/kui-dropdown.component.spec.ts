import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal, viewChild } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { afterEach } from 'vitest';

import { KuiCalendar } from '../calendar/kui-calendar.component';
import type { KuiDateRange } from '../calendar/kui-calendar.types';
import { KuiCalendarRange } from '../calendar-range/kui-calendar-range.component';
import { KuiDropdown } from './kui-dropdown.component';
import { KuiDropdownFor } from './kui-dropdown-for.directive';
import { KuiOption } from './kui-option.directive';

@Component({
  imports: [KuiDropdown, KuiDropdownFor, KuiOption],
  template: `
    <button id="trigger" type="button" [kuiDropdownFor]="dropdown">Open</button>
    <kui-dropdown #dropdown [(open)]="open">
      <div kuiOption value="first">First</div>
      <div kuiOption value="second">Second</div>
    </kui-dropdown>
  `,
})
class ControlledDropdownHost {
  readonly open = signal(false);
  readonly dropdown = viewChild.required(KuiDropdown);
}

@Component({
  imports: [KuiDropdown, KuiDropdownFor, KuiCalendar],
  template: `
    <button id="trigger" type="button" [kuiDropdownFor]="dropdown">Open</button>
    <kui-dropdown #dropdown [(open)]="open">
      <kui-calendar flat [(value)]="value" />
    </kui-dropdown>
  `,
})
class CalendarDropdownHost {
  readonly open = signal(false);
  readonly value = signal<Date | null>(null);
  readonly dropdown = viewChild.required(KuiDropdown);
}

@Component({
  imports: [KuiDropdown, KuiDropdownFor, KuiCalendarRange],
  template: `
    <button id="trigger" type="button" [kuiDropdownFor]="dropdown">Open</button>
    <kui-dropdown #dropdown [(open)]="open">
      <kui-calendar-range flat [(value)]="value" />
    </kui-dropdown>
  `,
})
class RangeCalendarDropdownHost {
  readonly open = signal(false);
  readonly value = signal<KuiDateRange | null>(null);
  readonly dropdown = viewChild.required(KuiDropdown);
}

describe('KuiDropdown', () => {
  afterEach(() => {
    TestBed.inject(OverlayContainer).getContainerElement().innerHTML = '';
  });

  it('opens from an externally controlled model value', async () => {
    const fixture = createFixture();
    const host = fixture.componentInstance;

    host.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.dropdown().isOpen()).toBe(true);
    expect(document.querySelector('.kui-dropdown')).not.toBeNull();
  });

  it('synchronizes the model when the imperative API opens the panel', () => {
    const fixture = createFixture();
    const host = fixture.componentInstance;

    host.dropdown().open();
    fixture.detectChanges();

    expect(host.open()).toBe(true);
    expect(host.dropdown().isOpen()).toBe(true);
  });

  it('synchronizes the model when the imperative API starts closing the panel', () => {
    const fixture = createFixture();
    const host = fixture.componentInstance;

    host.dropdown().open();
    fixture.detectChanges();
    host.dropdown().close();
    fixture.detectChanges();

    expect(host.open()).toBe(false);
    expect(document.querySelector('.kui-dropdown--closing')).not.toBeNull();
  });

  it('starts the close animation when the controlled model becomes false', async () => {
    const fixture = createFixture();
    const host = fixture.componentInstance;

    host.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    host.open.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(document.querySelector('.kui-dropdown--closing')).not.toBeNull();
  });

  it('closes after keyboard option selection in standalone mode', async () => {
    const fixture = createFixture();
    const host = fixture.componentInstance;

    host.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const option = document.querySelector<HTMLElement>('.kui-listbox-option');
    expect(option).not.toBeNull();

    option!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(host.open()).toBe(false);
    expect(document.querySelector('.kui-dropdown--closing')).not.toBeNull();
  });

  it('returns focus to the anchor when Escape closes a panel that held focus', async () => {
    const fixture = createCalendarFixture();
    const host = fixture.componentInstance;

    host.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const day = document.querySelector<HTMLElement>('.kui-dropdown .kui-calendar-grid button');
    expect(day).not.toBeNull();
    day!.focus();
    expect(document.activeElement).toBe(day);

    day!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(host.open()).toBe(false);
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('#trigger'));
  });

  it('leaves focus alone when Escape closes a panel that never held it', async () => {
    const fixture = createCalendarFixture();
    const host = fixture.componentInstance;
    const other = document.createElement('button');
    document.body.append(other);

    host.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    other.focus();
    other.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(host.open()).toBe(false);
    expect(document.activeElement).toBe(other);
    other.remove();
  });

  it('closes after picking a day in a single-date calendar panel', async () => {
    const fixture = createCalendarFixture();
    const host = fixture.componentInstance;

    host.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const day = document.querySelector<HTMLButtonElement>(
      '.kui-calendar-day:not(.kui-calendar-day--muted)',
    );
    day!.click();
    fixture.detectChanges();

    expect(host.open()).toBe(false);
    expect(document.querySelector('.kui-dropdown--closing')).not.toBeNull();
  });

  it('stays open after picking the start day in a kui-calendar-range panel', async () => {
    TestBed.configureTestingModule({ imports: [RangeCalendarDropdownHost] });
    const fixture = TestBed.createComponent(RangeCalendarDropdownHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;

    host.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const day = document.querySelector<HTMLButtonElement>(
      '.kui-calendar-day:not(.kui-calendar-day--muted)',
    );
    day!.click();
    fixture.detectChanges();

    expect(host.open()).toBe(true);
    expect(document.querySelector('.kui-dropdown--closing')).toBeNull();
  });
});

function createFixture(): ComponentFixture<ControlledDropdownHost> {
  TestBed.configureTestingModule({ imports: [ControlledDropdownHost] });
  const fixture = TestBed.createComponent(ControlledDropdownHost);
  fixture.detectChanges();
  return fixture;
}

function createCalendarFixture(): ComponentFixture<CalendarDropdownHost> {
  TestBed.configureTestingModule({ imports: [CalendarDropdownHost] });
  const fixture = TestBed.createComponent(CalendarDropdownHost);
  fixture.detectChanges();
  return fixture;
}
