import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KuiIconComponent } from '../icon/kui-icon.component';
import { KuiLoaderDirective } from '../loader/kui-loader.directive';
import { KuiFieldAffixDirective } from './kui-field-affix.directive';

@Component({
  imports: [KuiFieldAffixDirective],
  template: '<span kuiFieldAffix>https://</span>',
})
class TextAffixHost {}

@Component({
  imports: [KuiFieldAffixDirective, KuiIconComponent],
  template: '<kui-icon kuiFieldAffix name="search" />',
})
class IconAffixHost {}

@Component({
  imports: [KuiFieldAffixDirective],
  template: '<button kuiFieldAffix type="button" aria-label="Clear"></button>',
})
class ActionAffixHost {}

@Component({
  imports: [KuiFieldAffixDirective, KuiLoaderDirective],
  template: '<span kuiLoader kuiFieldAffix></span>',
})
class LoaderAffixHost {}

describe('KuiFieldAffixDirective', () => {
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
