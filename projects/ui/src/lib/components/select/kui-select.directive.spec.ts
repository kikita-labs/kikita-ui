import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { afterEach } from 'vitest';

import { kuiProvideSelectOptions } from '../../tokens';
import { KuiDropdownComponent } from '../dropdown/kui-dropdown.component';
import { KuiOptionDirective } from '../dropdown/kui-option.directive';
import { KuiFieldComponent } from '../field/kui-field.component';
import { KuiSelectDirective } from './kui-select.directive';
import { KuiSelectValueDirective } from './kui-select-value.directive';

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
      <input kuiSelect [(value)]="val" [clearable]="true" [readonly]="true" />
      <kui-dropdown>
        <div kuiOption value="a">Option A</div>
      </kui-dropdown>
    </kui-field>
  `,
})
class ReadonlyClearableHost {
  val = signal<string | null>('a');
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

@Component({
  imports: [KuiFieldComponent, KuiSelectDirective, KuiDropdownComponent, KuiOptionDirective],
  template: `
    <kui-field label="Choice" error="Choice is required">
      <input kuiSelect [(value)]="val" placeholder="Pick..." />
      <kui-dropdown>
        <div kuiOption value="a">Option A</div>
      </kui-dropdown>
    </kui-field>
  `,
})
class InvalidFieldHost {
  val = signal<string | null>(null);
}

@Component({
  imports: [KuiFieldComponent, KuiSelectDirective, KuiDropdownComponent, KuiOptionDirective],
  template: `
    <kui-field>
      <input
        kuiSelect
        [multiple]="true"
        [(value)]="val"
        [clearable]="true"
        [maxVisibleChips]="2"
        placeholder="Pick..."
      />
      <kui-dropdown>
        <div kuiOption value="a">Option A</div>
        <div kuiOption value="b">Option B</div>
        <div kuiOption value="c">Option C</div>
      </kui-dropdown>
    </kui-field>
  `,
})
class MultipleHost {
  val = signal<readonly string[]>(['a', 'b', 'c']);
}

@Component({
  imports: [KuiFieldComponent, KuiSelectDirective, KuiDropdownComponent, KuiOptionDirective],
  template: `
    <kui-field>
      <input kuiSelect multiple multipleDisplay="text" [(value)]="val" [multipleTextFn]="format" />
      <kui-dropdown>
        <div kuiOption value="a">Option A</div>
      </kui-dropdown>
    </kui-field>
  `,
})
class MultipleTextHost {
  val = signal<readonly string[]>(['a', 'b']);
  format = (items: readonly string[]) => items.map((item) => `prefix-${item}-postfix`).join(' | ');
}

@Component({
  imports: [
    KuiFieldComponent,
    KuiSelectDirective,
    KuiSelectValueDirective,
    KuiDropdownComponent,
    KuiOptionDirective,
  ],
  template: `
    <kui-field>
      <input kuiSelect multiple [(value)]="val" [maxVisibleChips]="2" />
      <ng-template kuiSelectValue let-label="label" let-remove="remove">
        <span class="custom-value">
          custom:{{ label
          }}<button type="button" class="custom-remove" (click)="remove()">x</button>
        </span>
      </ng-template>
      <kui-dropdown>
        <div kuiOption value="a">Option A</div>
        <div kuiOption value="b">Option B</div>
        <div kuiOption value="c">Option C</div>
      </kui-dropdown>
    </kui-field>
  `,
})
class MultipleTemplateHost {
  val = signal<readonly string[]>(['a', 'b', 'c']);
}

@Component({
  imports: [KuiFieldComponent, KuiSelectDirective, KuiDropdownComponent, KuiOptionDirective],
  template: `
    <kui-field>
      <input kuiSelect multiple [(value)]="val" />
      <kui-dropdown>
        <div kuiOption value="a">Option A</div>
        <div kuiOption value="b">Option B</div>
        <div kuiOption value="c">Option C</div>
      </kui-dropdown>
    </kui-field>
  `,
})
class SelectOptionsHost {
  val = signal<readonly string[]>(['a', 'b', 'c']);
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

function clickSelectInput(fixture: ComponentFixture<unknown>): void {
  const input = getInput(fixture);
  input.dispatchEvent(new Event('pointerdown', { bubbles: true }));
  input.click();
  fixture.detectChanges();
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

      expect(input.getAttribute('aria-expanded')).toBe('false');
      expect(input.getAttribute('aria-controls')).toBeNull();

      clickSelectInput(fixture);

      expect(input.getAttribute('aria-expanded')).toBe('true');
      expect(input.getAttribute('aria-controls')).toBeTruthy();
      expect(document.getElementById(input.getAttribute('aria-controls')!)).not.toBeNull();
    });

    it('does not open the dropdown when the label is clicked', () => {
      const fixture = createFixture(BasicHost);
      const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;

      label.click();
      fixture.detectChanges();

      expect(document.querySelector('.kui-dropdown')).toBeNull();
    });

    it('inherits aria-invalid from an invalid kui-field', () => {
      const fixture = createFixture(InvalidFieldHost);
      const input = getInput(fixture);

      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.getAttribute('aria-describedby')).toContain(`${input.id}-error`);
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

      clickSelectInput(fixture);

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

    it('resets multiple values to an empty array when clear button is clicked', () => {
      const fixture = createFixture(MultipleHost);

      const clearBtn = fixture.nativeElement.querySelector(
        '.kui-select-clear',
      ) as HTMLButtonElement;
      clearBtn.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.val()).toEqual([]);
    });

    it('disables clear button when readonly', () => {
      const fixture = createFixture(ReadonlyClearableHost);
      const clearBtn = fixture.nativeElement.querySelector(
        '.kui-select-clear',
      ) as HTMLButtonElement;

      expect(clearBtn).toBeTruthy();
      expect(clearBtn.disabled).toBe(true);
    });
  });

  describe('disabled', () => {
    it('sets disabled attribute on the native input', () => {
      const fixture = createFixture(DisabledHost);
      expect(getInput(fixture).hasAttribute('disabled')).toBe(true);
    });

    it('does not open dropdown when disabled field is clicked', () => {
      const fixture = createFixture(DisabledHost);
      clickSelectInput(fixture);

      expect(document.querySelector('.kui-dropdown')).toBeNull();
    });
  });

  describe('suffix actions', () => {
    it('uses a button chevron that toggles the dropdown', () => {
      const fixture = createFixture(BasicHost);
      const chevron = fixture.nativeElement.querySelector(
        '.kui-select-chevron',
      ) as HTMLButtonElement;

      expect(chevron.tagName.toLowerCase()).toBe('button');

      chevron.click();
      fixture.detectChanges();

      expect(document.querySelector('.kui-dropdown')).toBeTruthy();
      expect(chevron.getAttribute('aria-expanded')).toBe('true');

      chevron.click();
      fixture.detectChanges();

      const panel = document.querySelector('.kui-dropdown') as HTMLElement;
      const animationEnd = new Event('animationend') as AnimationEvent;
      Object.defineProperty(animationEnd, 'animationName', { value: 'kui-dropdown-out' });
      panel.dispatchEvent(animationEnd);
      fixture.detectChanges();

      expect(document.querySelector('.kui-dropdown')).toBeNull();
    });
  });

  describe('option selection', () => {
    it('updates value when an option is clicked', () => {
      const fixture = createFixture(BasicHost);

      clickSelectInput(fixture);

      const options = document.querySelectorAll('.kui-listbox-option');
      (options[0] as HTMLElement).click();
      fixture.detectChanges();

      expect(fixture.componentInstance.val()).toBe('a');
    });

    it('updates value to second option when clicked', () => {
      const fixture = createFixture(BasicHost);

      clickSelectInput(fixture);

      const options = document.querySelectorAll('.kui-listbox-option');
      (options[1] as HTMLElement).click();
      fixture.detectChanges();

      expect(fixture.componentInstance.val()).toBe('b');
    });

    it('renders selected multiple values as chips with collapsed overflow', () => {
      const fixture = createFixture(MultipleHost);
      const chips = fixture.nativeElement.querySelectorAll('[kuiChip]');

      expect(getInput(fixture).value).toBe('a, b, c');
      expect(chips).toHaveLength(3);
      expect(chips[0].textContent).toContain('a');
      expect(chips[1].textContent).toContain('b');
      expect(chips[2].textContent).toContain('+1');
    });

    it('removes a multiple value from its chip affordance', () => {
      const fixture = createFixture(MultipleHost);
      const remove = fixture.nativeElement.querySelector('[kuiChipRemove]') as HTMLButtonElement;

      remove.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.val()).toEqual(['b', 'c']);
    });

    it('can render multiple selected values as custom text instead of chips', () => {
      const fixture = createFixture(MultipleTextHost);

      expect(getInput(fixture).value).toBe('prefix-a-postfix | prefix-b-postfix');
      expect(fixture.nativeElement.querySelector('[kuiChip]')).toBeNull();
    });

    it('uses select provider defaults for clearable and visible chip count', async () => {
      await TestBed.resetTestingModule()
        .configureTestingModule({
          imports: [SelectOptionsHost],
          providers: [kuiProvideSelectOptions({ clearable: true, maxVisibleChips: 1 })],
        })
        .compileComponents();

      const fixture = TestBed.createComponent(SelectOptionsHost);
      fixture.detectChanges();

      const chips = fixture.nativeElement.querySelectorAll('[kuiChip]');

      expect(fixture.nativeElement.querySelector('.kui-select-clear')).toBeTruthy();
      expect(chips).toHaveLength(2);
      expect(chips[0].textContent).toContain('a');
      expect(chips[1].textContent).toContain('+2');
    });

    it('uses a custom selected value template when provided', () => {
      const fixture = createFixture(MultipleTemplateHost);
      const values = fixture.nativeElement.querySelectorAll('.custom-value');

      expect(values).toHaveLength(2);
      expect(values[0].textContent).toContain('custom:a');
      expect(values[1].textContent).toContain('custom:b');
      expect(fixture.nativeElement.textContent).toContain('+1');
    });

    it('exposes a remove callback to the custom selected value template', () => {
      const fixture = createFixture(MultipleTemplateHost);
      const remove = fixture.nativeElement.querySelector('.custom-remove') as HTMLButtonElement;

      remove.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.val()).toEqual(['b', 'c']);
    });
  });
});
