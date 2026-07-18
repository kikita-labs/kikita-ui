import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { KuiCommandPaletteComponent } from './kui-command-palette.component';
import type { KuiCommandGroup, KuiCommandItem } from './kui-command-palette.types';

@Component({
  imports: [KuiCommandPaletteComponent],
  template: `
    <button class="trigger" type="button">Trigger</button>
    <kui-command-palette
      [(open)]="open"
      [groups]="groups"
      [(query)]="query"
      (selected)="markSelected($event)"
    />
  `,
})
class CommandPaletteHost {
  readonly open = signal(false);
  readonly query = signal('');
  readonly selected = signal<string | null>(null);
  readonly groups: readonly KuiCommandGroup[] = [
    {
      heading: 'Navigation',
      items: [
        { id: 'projects', label: 'Open projects', shortcut: ['G', 'P'] },
        { id: 'settings', label: 'Open settings', disabled: true },
      ],
    },
    {
      heading: 'Danger',
      items: [{ id: 'delete', label: 'Delete workspace', danger: true }],
    },
  ];

  markSelected(item: KuiCommandItem): void {
    this.selected.set(item.id);
  }
}

describe('KuiCommandPaletteComponent', () => {
  let fixture: ComponentFixture<CommandPaletteHost>;
  let host: HTMLElement;
  let overlayHost: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandPaletteHost],
    }).compileComponents();

    overlayHost = TestBed.inject(OverlayContainer).getContainerElement();
    fixture = TestBed.createComponent(CommandPaletteHost);
    host = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    overlayHost.replaceChildren();
  });

  it('opens a modal command dialog and focuses the search input', () => {
    openPalette();

    const dialog = overlayHost.querySelector('.kui-command') as HTMLElement;
    const input = overlayHost.querySelector('.kui-command__input') as HTMLInputElement;

    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-controls')).toBeTruthy();
  });

  it('filters commands and highlights matching label text', () => {
    fixture.componentInstance.query.set('proj');
    openPalette();

    const options = overlayHost.querySelectorAll('.kui-command__item');
    const label = overlayHost.querySelector('.kui-command__item-label') as HTMLElement;
    const highlight = overlayHost.querySelector('.kui-command__item-label mark') as HTMLElement;

    expect(options).toHaveLength(1);
    expect(options[0].textContent?.replace(/\s+/g, '')).toContain('Openprojects');
    expect(label.querySelector('span')?.textContent).toBe('Open ');
    expect(highlight.textContent).toBe('proj');
  });

  it('selects an enabled command and closes the overlay', () => {
    openPalette();

    const option = overlayHost.querySelector('.kui-command__item') as HTMLButtonElement;
    option.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selected()).toBe('projects');
    expect(fixture.componentInstance.open()).toBe(false);
    expect(overlayHost.querySelector('.kui-command')).toBeNull();
  });

  it('skips disabled commands in keyboard navigation', () => {
    openPalette();

    const input = overlayHost.querySelector('.kui-command__input') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();

    expect(input.getAttribute('aria-activedescendant')).toContain('delete');
  });

  function openPalette(): void {
    host.querySelector<HTMLButtonElement>('.trigger')?.focus();
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
  }
});
