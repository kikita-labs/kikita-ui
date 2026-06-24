import { Component, signal, Signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KUI_OPTION_CONTEXT, KuiOptionContext } from './kui-option-context.token';
import { KuiOptionDirective } from './kui-option.directive';

// ── mock context ──────────────────────────────────────────────────────────────

class MockOptionContext implements KuiOptionContext {
  selected = signal(false);
  selections: unknown[] = [];

  isSelected = (_v: unknown): Signal<boolean> | boolean => this.selected();
  select = (v: unknown): void => { this.selections.push(v); };
}

// ── host fixtures ─────────────────────────────────────────────────────────────

@Component({
  imports: [KuiOptionDirective],
  providers: [{ provide: KUI_OPTION_CONTEXT, useClass: MockOptionContext }],
  template: `<div kuiOption value="a">Option A</div>`,
})
class BasicOptionHost {}

@Component({
  imports: [KuiOptionDirective],
  providers: [{ provide: KUI_OPTION_CONTEXT, useClass: MockOptionContext }],
  template: `<div kuiOption value="a" [disabled]="true">Option A</div>`,
})
class DisabledOptionHost {}

@Component({
  imports: [KuiOptionDirective],
  providers: [{ provide: KUI_OPTION_CONTEXT, useClass: MockOptionContext }],
  template: `<div kuiOption [value]="obj">Object option</div>`,
})
class ObjectOptionHost {
  obj = { id: 1 };
}

// ── helpers ───────────────────────────────────────────────────────────────────

function createFixture<T>(component: new () => T): ComponentFixture<T> {
  TestBed.configureTestingModule({ imports: [component] });
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  return fixture;
}

function getOption(fixture: ComponentFixture<unknown>): HTMLElement {
  return fixture.nativeElement.querySelector('[kuiOption]') as HTMLElement;
}

function getContext(fixture: ComponentFixture<unknown>): MockOptionContext {
  return fixture.debugElement.injector.get(KUI_OPTION_CONTEXT) as MockOptionContext;
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('KuiOptionDirective', () => {
  describe('host attributes', () => {
    it('sets role=option and tabindex=-1', () => {
      const fixture = createFixture(BasicOptionHost);
      const option = getOption(fixture);

      expect(option.getAttribute('role')).toBe('option');
      expect(option.getAttribute('tabindex')).toBe('-1');
      expect(option.classList.contains('kui-listbox-option')).toBe(true);
    });

    it('sets aria-disabled and removes tabindex when disabled', () => {
      const fixture = createFixture(DisabledOptionHost);
      const option = getOption(fixture);

      expect(option.getAttribute('aria-disabled')).toBe('true');
      expect(option.getAttribute('tabindex')).toBeNull();
      expect(option.classList.contains('kui-listbox-option--disabled')).toBe(true);
    });
  });

  describe('selection state', () => {
    it('reflects selected=false from context', () => {
      const fixture = createFixture(BasicOptionHost);
      const option = getOption(fixture);

      expect(option.getAttribute('aria-selected')).toBe('false');
      expect(option.classList.contains('kui-listbox-option--selected')).toBe(false);
    });

    it('reflects selected=true when context marks it selected', () => {
      const fixture = createFixture(BasicOptionHost);
      getContext(fixture).selected.set(true);
      fixture.detectChanges();

      const option = getOption(fixture);
      expect(option.getAttribute('aria-selected')).toBe('true');
      expect(option.classList.contains('kui-listbox-option--selected')).toBe(true);
    });
  });

  describe('click', () => {
    it('calls context.select with the option value on click', () => {
      const fixture = createFixture(BasicOptionHost);
      const ctx = getContext(fixture);

      getOption(fixture).click();

      expect(ctx.selections).toEqual(['a']);
    });

    it('passes object value to context.select', () => {
      const fixture = createFixture(ObjectOptionHost);
      const ctx = getContext(fixture);

      getOption(fixture).click();

      expect(ctx.selections[0]).toEqual({ id: 1 });
    });

    it('does not call context.select when disabled', () => {
      const fixture = createFixture(DisabledOptionHost);
      const ctx = getContext(fixture);

      getOption(fixture).click();

      expect(ctx.selections.length).toBe(0);
    });
  });
});
