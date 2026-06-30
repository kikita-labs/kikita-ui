import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { afterEach } from 'vitest';

import { KuiDropdownComponent } from '../dropdown/kui-dropdown.component';
import { KuiOptionDirective } from '../dropdown/kui-option.directive';
import { KuiFieldComponent } from '../field/kui-field.component';
import { KuiSelectDirective } from './kui-select.directive';

// Host fixtures

@Component({
  imports: [KuiFieldComponent, KuiSelectDirective, KuiDropdownComponent, KuiOptionDirective],
  template: `
    <kui-field label="Choice" hint="Pick one">
      <input kuiSelect [(value)]="val" placeholder="Pick..." (touch)="touches.set(touches() + 1)" />
      <kui-dropdown>
        <div kuiOption value="a">Option A</div>
        <div kuiOption value="b">Option B</div>
      </kui-dropdown>
    </kui-field>
  `,
})
class BasicHost {
  val = signal<string | null>(null);
  touches = signal(0);
}

interface User {
  id: number;
  name: string;
}

@Component({
  imports: [KuiFieldComponent, KuiSelectDirective, KuiDropdownComponent, KuiOptionDirective],
  template: `
    <kui-field>
      <input kuiSelect [(value)]="val" [kuiLabelFn]="label" placeholder="Pick..." />
      <kui-dropdown>
        <div kuiOption [value]="users[0]">Alice</div>
      </kui-dropdown>
    </kui-field>
  `,
})
class LabelFnHost {
  val = signal<User | null>(null);
  users: User[] = [{ id: 1, name: 'Alice' }];
  label = (u: User) => u.name;
}

@Component({
  imports: [KuiFieldComponent, KuiSelectDirective, KuiDropdownComponent, KuiOptionDirective],
  template: `
    <kui-field>
      <input kuiSelect [(value)]="val" [clearable]="true" />
      <kui-dropdown>
        <div kuiOption value="a">Option A</div>
      </kui-dropdown>
    </kui-field>
  `,
})
class ClearableHost {
  val = signal<string | null>(null);
}

@Component({
  imports: [KuiFieldComponent, KuiSelectDirective, KuiDropdownComponent, KuiOptionDirective],
  template: `
    <kui-field>
      <input kuiSelect [(value)]="val" [disabled]="true" />
      <kui-dropdown>
        <div kuiOption value="a">Option A</div>
      </kui-dropdown>
    </kui-field>
  `,
})
class DisabledHost {
  val = signal<string | null>(null);
}

// Helpers

function createFixture<T>(component: new () => T): ComponentFixture<T> {
  TestBed.configureTestingModule({ imports: [component] });
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  return fixture;
}

function getInput(fixture: ComponentFixture<unknown>): HTMLInputElement {
  return fixture.nativeElement.querySelector('input') as HTMLInputElement;
}

function getField(fixture: ComponentFixture<unknown>): HTMLElement {
  return fixture.nativeElement.querySelector('kui-field') as HTMLElement;
}

function cleanOverlay(): void {
  TestBed.inject(OverlayContainer).getContainerElement().innerHTML = '';
}

// Tests

describe('KuiSelectDirective', () => {
  afterEach(() => {
    cleanOverlay();
  });

  describe('ARIA', () => {
    it('sets combobox semantics on the native input', () => {
      const fixture = createFixture(BasicHost);
      const input = getInput(fixture);
      const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;

      expect(input.getAttribute('role')).toBe('combobox');
      expect(input.getAttribute('aria-haspopup')).toBe('listbox');
      expect(input.getAttribute('aria-autocomplete')).toBe('none');
      expect(input.hasAttribute('readonly')).toBe(true);
      expect(input.id).toBe(label.htmlFor);
      expect(input.getAttribute('aria-describedby')).toBe(`${input.id}-hint`);
    });

    it('reflects dropdown open state in aria-expanded', () => {
      const fixture = createFixture(BasicHost);
      const input = getInput(fixture);
      const field = getField(fixture);

      expect(input.getAttribute('aria-expanded')).toBe('false');

      field.click();
      fixture.detectChanges();

      expect(input.getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('value display', () => {
    it('shows string value directly in the input', () => {
      const fixture = createFixture(BasicHost);
      fixture.componentInstance.val.set('a');
      fixture.detectChanges();

      expect(getInput(fixture).value).toBe('a');
    });

    it('clears the input when value is set to null', () => {
      const fixture = createFixture(BasicHost);
      fixture.componentInstance.val.set('a');
      fixture.detectChanges();

      fixture.componentInstance.val.set(null);
      fixture.detectChanges();

      expect(getInput(fixture).value).toBe('');
    });

    it('uses kuiLabelFn to display object values', () => {
      const fixture = createFixture(LabelFnHost);
      fixture.componentInstance.val.set({ id: 1, name: 'Alice' });
      fixture.detectChanges();

      expect(getInput(fixture).value).toBe('Alice');
    });
  });

  describe('touch output', () => {
    it('does not emit touch during initial render', () => {
      const fixture = createFixture(BasicHost);
      expect(fixture.componentInstance.touches()).toBe(0);
    });

    it('emits touch after an opened dropdown closes', () => {
      const fixture = createFixture(BasicHost);

      getField(fixture).click();
      fixture.detectChanges();

      const option = document.querySelector('.kui-listbox-option') as HTMLElement;
      option.click();
      fixture.detectChanges();

      const panel = document.querySelector('.kui-dropdown') as HTMLElement;
      const animationEnd = new Event('animationend') as AnimationEvent;
      Object.defineProperty(animationEnd, 'animationName', { value: 'kui-dropdown-out' });
      panel.dispatchEvent(animationEnd);
      fixture.detectChanges();

      expect(fixture.componentInstance.touches()).toBe(1);
    });
  });

  describe('clearable', () => {
    it('does not render clear button when clearable is false', () => {
      const fixture = createFixture(BasicHost);
      fixture.componentInstance.val.set('a');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.kui-select-clear')).toBeNull();
    });

    it('does not render clear button when clearable and value is null', () => {
      const fixture = createFixture(ClearableHost);
      expect(fixture.nativeElement.querySelector('.kui-select-clear')).toBeNull();
    });

    it('renders clear button when clearable and value is set', () => {
      const fixture = createFixture(ClearableHost);
      fixture.componentInstance.val.set('a');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.kui-select-clear')).toBeTruthy();
    });

    it('resets value to null when clear button is clicked', () => {
      const fixture = createFixture(ClearableHost);
      fixture.componentInstance.val.set('a');
      fixture.detectChanges();

      const clearBtn = fixture.nativeElement.querySelector(
        '.kui-select-clear',
      ) as HTMLButtonElement;
      clearBtn.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.val()).toBeNull();
    });
  });

  describe('disabled', () => {
    it('sets disabled attribute on the native input', () => {
      const fixture = createFixture(DisabledHost);
      expect(getInput(fixture).hasAttribute('disabled')).toBe(true);
    });

    it('does not open dropdown when disabled field is clicked', () => {
      const fixture = createFixture(DisabledHost);
      getField(fixture).click();
      fixture.detectChanges();

      expect(document.querySelector('.kui-dropdown')).toBeNull();
    });
  });

  describe('option selection', () => {
    it('updates value when an option is clicked', () => {
      const fixture = createFixture(BasicHost);

      getField(fixture).click();
      fixture.detectChanges();

      const options = document.querySelectorAll('.kui-listbox-option');
      (options[0] as HTMLElement).click();
      fixture.detectChanges();

      expect(fixture.componentInstance.val()).toBe('a');
    });

    it('updates value to second option when clicked', () => {
      const fixture = createFixture(BasicHost);

      getField(fixture).click();
      fixture.detectChanges();

      const options = document.querySelectorAll('.kui-listbox-option');
      (options[1] as HTMLElement).click();
      fixture.detectChanges();

      expect(fixture.componentInstance.val()).toBe('b');
    });
  });
});
