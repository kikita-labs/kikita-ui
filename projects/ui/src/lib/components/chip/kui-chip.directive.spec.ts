import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { KuiChipDirective } from './kui-chip.directive';
import { KuiChipRemoveDirective } from './kui-chip-remove.directive';

@Component({
  template: `
    <span
      kuiChip
      size="sm"
      appearance="primary"
      [disabled]="disabled()"
      [invalid]="invalid()"
      (removed)="removed.set(removed() + 1)"
    >
      <span class="kui-chip-label">Design</span>
      <button kuiChipRemove aria-label="Remove Design">x</button>
    </span>
  `,
  imports: [KuiChipDirective, KuiChipRemoveDirective],
})
class TestChipHost {
  readonly disabled = signal(false);
  readonly invalid = signal(false);
  readonly removed = signal(0);
}

describe('KuiChipDirective', () => {
  let fixture: ComponentFixture<TestChipHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestChipHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestChipHost);
    fixture.detectChanges();
  });

  it('reflects size, appearance, and invalid state', () => {
    const host = fixture.nativeElement.querySelector('[kuiChip]') as HTMLElement;

    expect(host.classList.contains('kui-chip')).toBe(true);
    expect(host.dataset['kuiSize']).toBe('sm');
    expect(host.dataset['kuiAppearance']).toBe('primary');

    fixture.componentInstance.invalid.set(true);
    fixture.detectChanges();

    expect(host.classList.contains('kui-chip--invalid')).toBe(true);
  });

  it('emits removed from the nested remove button', () => {
    const remove = fixture.nativeElement.querySelector('[kuiChipRemove]') as HTMLButtonElement;

    remove.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.removed()).toBe(1);
  });

  it('makes remove action inert when disabled', () => {
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('[kuiChip]') as HTMLElement;
    const remove = fixture.nativeElement.querySelector('[kuiChipRemove]') as HTMLButtonElement;

    expect(host.getAttribute('aria-disabled')).toBe('true');
    expect(remove.getAttribute('aria-disabled')).toBe('true');
    expect(remove.getAttribute('tabindex')).toBe('-1');

    remove.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.removed()).toBe(0);
  });
});
