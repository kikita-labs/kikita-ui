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
      [groups]="groups()"
      [(query)]="query"
      (selected)="markSelected($event)"
    />
  `,
})
class CommandPaletteHost {
  readonly open = signal(false);
  readonly query = signal('');
  readonly selected = signal<string | null>(null);
  readonly selectedItem = signal<KuiCommandItem | null>(null);
  readonly groups = signal<readonly KuiCommandGroup[]>([
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
  ]);

  markSelected(item: KuiCommandItem): void {
    this.selected.set(item.id);
    this.selectedItem.set(item);
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

  it('keeps command keys when duplicate labels are filtered, reordered, and relabeled', () => {
    const first = { id: 'file.open', label: 'Open', keywords: ['file'] };
    const second = { id: 'project.open', label: 'Open', keywords: ['project'] };
    fixture.componentInstance.groups.set([
      { heading: 'Files', items: [first] },
      { heading: 'Projects', items: [second] },
    ]);
    openPalette();
    const before = overlayHost.querySelectorAll<HTMLElement>('[role="option"]');
    const secondId = before[1].id;
    expect(before[0].id).not.toBe(secondId);
    fixture.componentInstance.query.set('project');
    fixture.detectChanges();
    expect(overlayHost.querySelector('[role="option"]')?.id).toBe(secondId);
    const translated = { ...second, label: 'Projekt oeffnen' };
    fixture.componentInstance.query.set('');
    fixture.componentInstance.groups.set([
      { heading: 'Projects', items: [translated] },
      { heading: 'Files', items: [{ ...first }] },
    ]);
    fixture.detectChanges();
    const input = overlayHost.querySelector<HTMLInputElement>('.kui-command__input')!;
    expect(input.getAttribute('aria-activedescendant')).toBe(secondId);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedItem()).toBe(translated);
  });

  it('resets to the first enabled command when the active command disappears', () => {
    openPalette();
    const input = overlayHost.querySelector<HTMLInputElement>('.kui-command__input')!;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(input.getAttribute('aria-activedescendant')).toContain('delete');
    fixture.componentInstance.groups.set([
      { items: [{ id: 'replacement', label: 'Replacement' }] },
    ]);
    fixture.detectChanges();
    expect(input.getAttribute('aria-activedescendant')).toContain('replacement');
    fixture.componentInstance.groups.set([]);
    fixture.detectChanges();
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
  });

  it.each(['', 'two words', 'tab\tid'])('rejects invalid id %j in development', (id) => {
    fixture.componentInstance.groups.set([{ items: [{ id, label: 'Invalid' }] }]);
    expect(() => openPalette()).toThrow(/non-empty string without whitespace/);
  });

  it('rejects duplicate IDs across groups in development', () => {
    fixture.componentInstance.groups.set([
      { heading: 'First', items: [{ id: 'same', label: 'One' }] },
      { heading: 'Second', items: [{ id: 'same', label: 'Two' }] },
    ]);
    expect(() => openPalette()).toThrow(/unique across all groups/);
  });

  it('namespaces punctuation-bearing command keys across palette instances', () => {
    const item = { id: 'project:open/a#b', label: 'Open' };
    fixture.componentInstance.groups.set([{ items: [item] }]);
    openPalette();
    const second = TestBed.createComponent(KuiCommandPaletteComponent);
    try {
      second.componentRef.setInput('groups', [{ items: [item] }]);
      second.componentInstance.open.set(true);
      second.detectChanges();
      const options = overlayHost.querySelectorAll<HTMLElement>('[role="option"]');
      expect(options).toHaveLength(2);
      expect(options[0].id).not.toBe(options[1].id);
      expect(document.getElementById(options[1].id)).toBe(options[1]);
    } finally {
      second.destroy();
    }
  });

  function openPalette(): void {
    host.querySelector<HTMLButtonElement>('.trigger')?.focus();
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
  }
});
