import { Component, computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { kuiProvideComboboxOptions, kuiProvideFieldOptions } from '../../tokens';
import { KuiDropdownComponent, KuiOptionDirective } from '../dropdown';
import { KuiFieldComponent } from '../field/kui-field.component';
import { KuiComboboxDirective } from './kui-combobox.directive';
import { KuiComboboxHighlightPipe } from './kui-combobox-highlight.pipe';

@Component({
  template: `
    <kui-field label="Assignee" hint="Pick one">
      <input
        kuiCombobox
        [(value)]="value"
        [(query)]="query"
        [kuiLabelFn]="label"
        placeholder="Search..."
        (search)="searches.set([...searches(), $event])"
      />
      <kui-dropdown>
        @for (option of filteredOptions(); track option.id) {
          <button kuiOption [value]="option">
            <span class="kui-combobox-match-label">
              @for (segment of option.name | kuiComboboxHighlight: query(); track $index) {
                @if (segment.match) {
                  <mark class="kui-combobox-highlight">{{ segment.text }}</mark>
                } @else {
                  <span>{{ segment.text }}</span>
                }
              }
            </span>
          </button>
        }
      </kui-dropdown>
    </kui-field>
  `,
  imports: [
    KuiFieldComponent,
    KuiDropdownComponent,
    KuiOptionDirective,
    KuiComboboxDirective,
    KuiComboboxHighlightPipe,
  ],
})
class TestComboboxHost {
  readonly options = [
    { id: 1, name: 'Alpha' },
    { id: 2, name: 'Beta' },
    { id: 3, name: 'Gamma' },
  ];
  readonly value = signal<{ id: number; name: string } | null>(null);
  readonly query = signal('');
  readonly searches = signal<readonly string[]>([]);
  readonly label = (item: { id: number; name: string }): string => item.name;
  readonly filteredOptions = computed(() => {
    const query = this.query().toLocaleLowerCase();
    return query
      ? this.options.filter((option) => option.name.toLocaleLowerCase().includes(query))
      : this.options;
  });
}

@Component({
  template: `
    <kui-field label="Free">
      <input kuiCombobox mode="free" [(value)]="value" [(query)]="query" />
      <kui-dropdown>
        <button kuiOption value="Alpha">Alpha</button>
      </kui-dropdown>
    </kui-field>
  `,
  imports: [KuiFieldComponent, KuiDropdownComponent, KuiOptionDirective, KuiComboboxDirective],
})
class TestFreeComboboxHost {
  readonly value = signal<string | null>(null);
  readonly query = signal('');
}

@Component({
  template: `
    <kui-field label="State">
      <input kuiCombobox [(value)]="value" [disabled]="disabled()" [readonly]="readonly()" />
      <kui-dropdown>
        <button kuiOption value="Alpha">Alpha</button>
      </kui-dropdown>
    </kui-field>
  `,
  imports: [KuiFieldComponent, KuiDropdownComponent, KuiOptionDirective, KuiComboboxDirective],
})
class TestStateComboboxHost {
  readonly value = signal<string | null>('Alpha');
  readonly disabled = signal(false);
  readonly readonly = signal(false);
}

function clickComboboxInput(input: HTMLInputElement): void {
  input.dispatchEvent(new Event('pointerdown', { bubbles: true }));
  input.click();
}

describe('KuiComboboxDirective', () => {
  let fixture: ComponentFixture<TestComboboxHost>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComboboxHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComboboxHost);
    host = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.replaceChildren();
  });

  it('emits search text and filters projected dropdown options', () => {
    const input = host.querySelector('input') as HTMLInputElement;

    input.value = 'be';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.searches()).toEqual(['be']);
    const optionText = document.querySelector('.kui-listbox-option')?.textContent ?? '';

    expect(optionText.replace(/\s+/g, '')).toContain('Beta');
    expect(document.body.textContent).not.toContain('Alpha');
  });

  it('highlights matched option text through the combobox highlight pipe', () => {
    const input = host.querySelector('input') as HTMLInputElement;

    input.value = 'be';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const highlight = document.querySelector('.kui-combobox-highlight') as HTMLElement;

    expect(highlight.textContent).toBe('Be');
  });

  it('selects a projected option and writes its label into the native input', () => {
    const input = host.querySelector('input') as HTMLInputElement;

    clickComboboxInput(input);
    fixture.detectChanges();

    const option = document.querySelector('.kui-listbox-option') as HTMLButtonElement;
    option.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()?.name).toBe('Alpha');
    expect(input.value).toBe('Alpha');
  });

  it('opens on the first click and keeps the dropdown open', () => {
    const input = host.querySelector('input') as HTMLInputElement;

    clickComboboxInput(input);
    fixture.detectChanges();

    expect(document.querySelector('.kui-dropdown')).toBeTruthy();
  });

  it('does not open the dropdown when the label is clicked', () => {
    const label = host.querySelector('label') as HTMLLabelElement;

    label.click();
    fixture.detectChanges();

    expect(document.querySelector('.kui-dropdown')).toBeNull();
  });

  it('clears value and query through the suffix action', () => {
    fixture.componentInstance.value.set(fixture.componentInstance.options[0]);
    fixture.detectChanges();

    const clear = host.querySelector('.kui-combobox-clear') as HTMLButtonElement;
    clear.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBeNull();
    expect(fixture.componentInstance.query()).toBe('');
  });

  it('uses field id, description, and provider clearable defaults', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [TestComboboxHost],
        providers: [
          kuiProvideFieldOptions({ clearable: false }),
          kuiProvideComboboxOptions({ clearable: true }),
        ],
      })
      .compileComponents();

    const providerFixture = TestBed.createComponent(TestComboboxHost);
    providerFixture.detectChanges();

    const providerHost = providerFixture.nativeElement as HTMLElement;
    const input = providerHost.querySelector('input') as HTMLInputElement;

    providerFixture.componentInstance.value.set(providerFixture.componentInstance.options[0]);
    providerFixture.detectChanges();

    expect(input.id).toBe(providerHost.querySelector('label')?.getAttribute('for'));
    expect(input.getAttribute('aria-describedby')).toContain('-hint');
    expect(providerHost.querySelector('.kui-combobox-clear')).toBeTruthy();
  });

  it('stores typed text as value in free mode', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({ imports: [TestFreeComboboxHost] })
      .compileComponents();

    const freeFixture = TestBed.createComponent(TestFreeComboboxHost);
    freeFixture.detectChanges();

    const input = freeFixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'Custom';
    input.dispatchEvent(new Event('input'));
    freeFixture.detectChanges();

    expect(freeFixture.componentInstance.value()).toBe('Custom');
  });

  it('does not clear or open when disabled', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({ imports: [TestStateComboboxHost] })
      .compileComponents();

    const stateFixture = TestBed.createComponent(TestStateComboboxHost);
    stateFixture.componentInstance.disabled.set(true);
    stateFixture.detectChanges();

    const input = stateFixture.nativeElement.querySelector('input') as HTMLInputElement;
    const clear = stateFixture.nativeElement.querySelector('.kui-combobox-clear');

    input.click();
    fixture.detectChanges();

    expect(clear).toBeNull();
    expect(document.querySelector('.kui-dropdown')).toBeNull();
    expect(stateFixture.componentInstance.value()).toBe('Alpha');
  });

  it('does not clear or open when readonly', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({ imports: [TestStateComboboxHost] })
      .compileComponents();

    const stateFixture = TestBed.createComponent(TestStateComboboxHost);
    stateFixture.componentInstance.readonly.set(true);
    stateFixture.detectChanges();

    const input = stateFixture.nativeElement.querySelector('input') as HTMLInputElement;
    const clear = stateFixture.nativeElement.querySelector('.kui-combobox-clear');

    input.click();
    fixture.detectChanges();

    expect(clear).toBeNull();
    expect(document.querySelector('.kui-dropdown')).toBeNull();
    expect(stateFixture.componentInstance.value()).toBe('Alpha');
  });
});
