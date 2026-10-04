import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KuiIcon } from '../icon/kui-icon';
import { KuiLoader } from '../loader/kui-loader';
import { KuiFieldAffix } from './kui-field-affix';

@Component({
  imports: [KuiFieldAffix],
  template: '<span kuiFieldAffix>https://</span>',
})
class TextAffixHost {}

@Component({
  imports: [KuiFieldAffix, KuiIcon],
  template: '<kui-icon kuiFieldAffix name="search" />',
})
class IconAffixHost {}

@Component({
  imports: [KuiFieldAffix],
  template: '<button kuiFieldAffix type="button" aria-label="Clear"></button>',
})
class ActionAffixHost {}

@Component({
  imports: [KuiFieldAffix, KuiLoader],
  template: '<span kuiLoader kuiFieldAffix></span>',
})
class LoaderAffixHost {}

describe('KuiFieldAffix', () => {
  it('defaults to text styling on a plain element', () => {
    const fixture = createFixture(TextAffixHost);

    const el = fixture.nativeElement.querySelector('[kuiFieldAffix]') as HTMLElement;

    expect(el.classList.contains('kui-field-affix')).toBe(true);
    expect(el.classList.contains('kui-field-affix-icon')).toBe(false);
    expect(el.classList.contains('kui-field-action')).toBe(false);
    expect(el.getAttribute('aria-hidden')).toBeNull();
  });

  it('auto-detects icon styling on a kui-icon host and delegates aria-hidden to it', () => {
    const fixture = createFixture(IconAffixHost);

    const el = fixture.nativeElement.querySelector('kui-icon') as HTMLElement;

    expect(el.classList.contains('kui-field-affix-icon')).toBe(true);
    expect(el.classList.contains('kui-field-affix')).toBe(false);
    // kui-icon owns aria-hidden itself (true when unlabeled); the directive must not also force it.
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('auto-detects icon styling on a kuiLoader host without silencing its aria-live status', () => {
    const fixture = createFixture(LoaderAffixHost);

    const el = fixture.nativeElement.querySelector('[kuiLoader]') as HTMLElement;

    expect(el.classList.contains('kui-field-affix-icon')).toBe(true);
    expect(el.classList.contains('kui-field-affix')).toBe(false);
    expect(el.getAttribute('role')).toBe('status');
    expect(el.getAttribute('aria-live')).toBe('polite');
    expect(el.getAttribute('aria-hidden')).toBeNull();
  });

  it('auto-detects action styling on a button host', () => {
    const fixture = createFixture(ActionAffixHost);

    const el = fixture.nativeElement.querySelector('button') as HTMLElement;

    expect(el.classList.contains('kui-field-action')).toBe(true);
    expect(el.classList.contains('kui-field-affix')).toBe(false);
    expect(el.getAttribute('aria-hidden')).toBeNull();
  });
});

function createFixture<T>(component: new () => T): ComponentFixture<T> {
  TestBed.configureTestingModule({ imports: [component] });

  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();

  return fixture;
}
