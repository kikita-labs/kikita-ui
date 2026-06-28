import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { KuiAccordionComponent } from './kui-accordion.component';
import { KuiAccordionItemComponent } from './kui-accordion-item.component';

@Component({
  imports: [KuiAccordionComponent, KuiAccordionItemComponent],
  template: `
    <kui-accordion [mode]="mode()" [(expandedItems)]="expanded">
      <kui-accordion-item id="a" header="Section A">Body A</kui-accordion-item>
      <kui-accordion-item id="b" header="Section B">Body B</kui-accordion-item>
      <kui-accordion-item id="c" header="Section C" [disabled]="true">Body C</kui-accordion-item>
    </kui-accordion>
  `,
})
class AccordionHost {
  readonly mode = signal<'exclusive' | 'multi'>('exclusive');
  readonly expanded = signal<string[]>([]);
}

describe('KuiAccordionComponent', () => {
  let fixture: ComponentFixture<AccordionHost>;
  let host: AccordionHost;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AccordionHost] });
    fixture = TestBed.createComponent(AccordionHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function triggers(): HTMLButtonElement[] {
    return fixture.debugElement
      .queryAll(By.css('.kui-accordion-trigger'))
      .map((de) => de.nativeElement as HTMLButtonElement);
  }

  function bodyWraps(): HTMLElement[] {
    return fixture.debugElement
      .queryAll(By.css('.kui-accordion-body-wrap'))
      .map((de) => de.nativeElement as HTMLElement);
  }

  it('renders three accordion items', () => {
    expect(triggers().length).toBe(3);
  });

  it('all items start collapsed', () => {
    expect(bodyWraps().every((w) => !w.classList.contains('is-open'))).toBe(true);
  });

  it('clicking a trigger opens it (exclusive mode)', () => {
    triggers()[0].click();
    fixture.detectChanges();
    expect(bodyWraps()[0].classList.contains('is-open')).toBe(true);
    expect(bodyWraps()[1].classList.contains('is-open')).toBe(false);
  });

  it('exclusive mode: opening B closes A', () => {
    triggers()[0].click();
    fixture.detectChanges();
    triggers()[1].click();
    fixture.detectChanges();
    expect(bodyWraps()[0].classList.contains('is-open')).toBe(false);
    expect(bodyWraps()[1].classList.contains('is-open')).toBe(true);
  });

  it('exclusive mode: clicking open item closes it', () => {
    triggers()[0].click();
    fixture.detectChanges();
    triggers()[0].click();
    fixture.detectChanges();
    expect(bodyWraps()[0].classList.contains('is-open')).toBe(false);
  });

  it('multi mode: multiple items can be open', () => {
    host.mode.set('multi');
    fixture.detectChanges();
    triggers()[0].click();
    fixture.detectChanges();
    triggers()[1].click();
    fixture.detectChanges();
    expect(bodyWraps()[0].classList.contains('is-open')).toBe(true);
    expect(bodyWraps()[1].classList.contains('is-open')).toBe(true);
  });

  it('disabled trigger has aria-disabled and tabindex=-1', () => {
    const disabledTrigger = triggers()[2];
    expect(disabledTrigger.getAttribute('aria-disabled')).toBe('true');
    expect(disabledTrigger.getAttribute('tabindex')).toBe('-1');
  });

  it('disabled trigger click does not open the item', () => {
    triggers()[2].click();
    fixture.detectChanges();
    expect(bodyWraps()[2].classList.contains('is-open')).toBe(false);
  });

  it('trigger has aria-controls pointing to body id', () => {
    const trigger = triggers()[0];
    const bodyId = trigger.getAttribute('aria-controls');
    expect(bodyId).toBeTruthy();
    const body = fixture.nativeElement.querySelector(`#${bodyId}`);
    expect(body).toBeTruthy();
    expect(body.classList.contains('kui-accordion-body-wrap')).toBe(true);
  });

  it('body has role=region and aria-labelledby pointing to trigger', () => {
    const body = bodyWraps()[0];
    expect(body.getAttribute('role')).toBe('region');
    const labelId = body.getAttribute('aria-labelledby');
    const trigger = fixture.nativeElement.querySelector(`#${labelId}`);
    expect(trigger).toBeTruthy();
    expect(trigger.classList.contains('kui-accordion-trigger')).toBe(true);
  });

  it('expandedItems model reflects open state', () => {
    triggers()[0].click();
    fixture.detectChanges();
    expect(host.expanded()).toContain('a');
  });

  it('setting expandedItems externally opens the item', () => {
    host.expanded.set(['b']);
    fixture.detectChanges();
    expect(bodyWraps()[1].classList.contains('is-open')).toBe(true);
  });
});
