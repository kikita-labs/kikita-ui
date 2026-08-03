import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { form, FormField } from '@angular/forms/signals';

import { KuiFieldComponent } from '../field';
import { KuiSegmentDirective } from './kui-segment.directive';
import { KuiSegmentedComponent } from './kui-segmented.component';

@Component({
  imports: [KuiSegmentedComponent, KuiSegmentDirective],
  template: `
    <kui-segmented [(value)]="selected" aria-label="View mode">
      <button kuiSegment value="list">List</button>
      <button kuiSegment value="grid">Grid</button>
      <button kuiSegment value="table" disabled>Table</button>
    </kui-segmented>
  `,
})
class SegmentedHost {
  readonly selected = signal('list');
}

@Component({
  imports: [KuiSegmentedComponent, KuiSegmentDirective],
  template: `
    <kui-segmented [(selected)]="selected" aria-label="View mode">
      <button kuiSegment value="list">List</button>
      <button kuiSegment value="grid">Grid</button>
    </kui-segmented>
  `,
})
class DeprecatedSelectedHost {
  readonly selected = signal('list');
}

@Component({
  imports: [KuiSegmentedComponent, KuiSegmentDirective],
  template: `
    <kui-segmented
      [selected]="selected()"
      (selectedChange)="selected.set($event)"
      aria-label="View mode"
    >
      <button kuiSegment value="list">List</button>
      <button kuiSegment value="grid">Grid</button>
    </kui-segmented>
  `,
})
class SplitBindingSelectedHost {
  readonly selected = signal('grid');
}

@Component({
  imports: [FormField, KuiFieldComponent, KuiSegmentedComponent, KuiSegmentDirective],
  template: `
    <kui-field label="View">
      <kui-segmented [formField]="settingsForm.view" aria-label="View mode">
        <button kuiSegment value="list">List</button>
        <button kuiSegment value="grid">Grid</button>
      </kui-segmented>
    </kui-field>
  `,
})
class SignalFormsHost {
  readonly model = signal({ view: 'list' });
  readonly settingsForm = form(this.model);
}

describe('KuiSegmentedComponent', () => {
  function createFixture(): ComponentFixture<SegmentedHost> {
    TestBed.configureTestingModule({ imports: [SegmentedHost] });
    const fixture = TestBed.createComponent(SegmentedHost);
    fixture.detectChanges();
    return fixture;
  }

  it('renders radiogroup and radio roles', () => {
    const fixture = createFixture();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('[role="radiogroup"]')).not.toBeNull();
    expect(el.querySelectorAll('[role="radio"]').length).toBe(3);
  });

  it('sets aria-checked on the selected segment', () => {
    const fixture = createFixture();
    const items = fixture.nativeElement.querySelectorAll(
      '[role="radio"]',
    ) as NodeListOf<HTMLElement>;

    expect(items[0].getAttribute('aria-checked')).toBe('true');
    expect(items[1].getAttribute('aria-checked')).toBe('false');
    expect(items[2].getAttribute('aria-checked')).toBe('false');
  });

  it('switches selected segment on click', () => {
    const fixture = createFixture();
    const items = fixture.nativeElement.querySelectorAll(
      '[role="radio"]',
    ) as NodeListOf<HTMLElement>;

    items[1].click();
    fixture.detectChanges();

    expect(items[0].getAttribute('aria-checked')).toBe('false');
    expect(items[1].getAttribute('aria-checked')).toBe('true');
  });

  it('roving tabindex: selected has 0, others -1', () => {
    const fixture = createFixture();
    const items = fixture.nativeElement.querySelectorAll(
      '[role="radio"]',
    ) as NodeListOf<HTMLElement>;

    expect(items[0].getAttribute('tabindex')).toBe('0');
    expect(items[1].getAttribute('tabindex')).toBe('-1');
    expect(items[2].getAttribute('tabindex')).toBe('-1');
  });

  it('does not select disabled segments', () => {
    const fixture = createFixture();
    const items = fixture.nativeElement.querySelectorAll(
      '[role="radio"]',
    ) as NodeListOf<HTMLElement>;

    items[2].click();
    fixture.detectChanges();

    expect(items[0].getAttribute('aria-checked')).toBe('true');
    expect(items[2].getAttribute('aria-checked')).toBe('false');
    expect(items[2].hasAttribute('disabled')).toBe(true);
  });

  it('deprecated [(selected)] still two-way binds', () => {
    TestBed.configureTestingModule({ imports: [DeprecatedSelectedHost] });
    const fixture = TestBed.createComponent(DeprecatedSelectedHost);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll(
      '[role="radio"]',
    ) as NodeListOf<HTMLElement>;

    items[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selected()).toBe('grid');
  });

  it('honors initial [selected] value with split property + event binding (no banana-in-box)', () => {
    TestBed.configureTestingModule({ imports: [SplitBindingSelectedHost] });
    const fixture = TestBed.createComponent(SplitBindingSelectedHost);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll(
      '[role="radio"]',
    ) as NodeListOf<HTMLElement>;

    expect(items[0].getAttribute('aria-checked')).toBe('false');
    expect(items[1].getAttribute('aria-checked')).toBe('true');
  });

  it('binds to Signal Forms via [formField]', () => {
    TestBed.configureTestingModule({ imports: [SignalFormsHost] });
    const fixture = TestBed.createComponent(SignalFormsHost);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll(
      '[role="radio"]',
    ) as NodeListOf<HTMLElement>;

    expect(items[0].getAttribute('aria-checked')).toBe('true');

    items[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.model().view).toBe('grid');
  });
});
