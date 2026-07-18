import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KuiTreeComponent } from './kui-tree.component';
import type { KuiTreeMode, KuiTreeNode } from './kui-tree-node.interface';

const NODES: KuiTreeNode[] = [
  {
    id: 'root-a',
    label: 'Alpha',
    children: [
      { id: 'child-a1', label: 'Apple' },
      { id: 'child-a2', label: 'Banana', disabled: true },
    ],
  },
  { id: 'root-b', label: 'Beta' },
  { id: 'root-c', label: 'Charlie', lazy: true },
];

@Component({
  imports: [KuiTreeComponent],
  template: `
    <kui-tree
      ariaLabel="Test tree"
      [mode]="mode()"
      [data]="nodes"
      [(selected)]="selected"
      [(checkedIds)]="checkedIds"
      [(expandedIds)]="expandedIds"
      [loadChildren]="loadChildren"
    />
  `,
})
class TreeHost {
  readonly mode = signal<KuiTreeMode>('display');
  readonly nodes = NODES;
  readonly selected = signal<string | null>(null);
  readonly checkedIds = signal<string[]>([]);
  readonly expandedIds = signal<string[]>(['root-a']);

  loadChildrenImpl: (node: KuiTreeNode) => Promise<KuiTreeNode[]> = () =>
    Promise.resolve([{ id: 'lazy-1', label: 'Lazy child' }]);

  readonly loadChildren = (node: KuiTreeNode): Promise<KuiTreeNode[]> =>
    this.loadChildrenImpl(node);
}

describe('KuiTreeComponent', () => {
  let fixture: ComponentFixture<TreeHost>;
  let host: TreeHost;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TreeHost] });
    fixture = TestBed.createComponent(TreeHost);
    host = fixture.componentInstance;
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.nativeElement.remove();
  });

  function rows(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('[role="treeitem"]'));
  }

  function rowById(id: string): HTMLElement {
    return fixture.nativeElement.querySelector(`[data-node-id="${id}"]`)!;
  }

  it('renders root nodes and, once expanded, their children', () => {
    expect(rows().map((r) => r.dataset['nodeId'])).toEqual([
      'root-a',
      'child-a1',
      'child-a2',
      'root-b',
      'root-c',
    ]);
  });

  it('collapsing via the toggle button hides children and updates expandedIds', () => {
    rowById('root-a').querySelector<HTMLButtonElement>('.kui-tree-toggle')!.click();
    fixture.detectChanges();

    expect(rows().map((r) => r.dataset['nodeId'])).toEqual(['root-a', 'root-b', 'root-c']);
    expect(host.expandedIds()).not.toContain('root-a');
  });

  it('roving tabindex defaults to the first visible node', () => {
    expect(rowById('root-a').tabIndex).toBe(0);
    expect(rowById('child-a1').tabIndex).toBe(-1);
  });

  it('ArrowDown moves the roving tabindex and DOM focus to the next visible row', () => {
    rowById('root-a').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();

    expect(rowById('child-a1').tabIndex).toBe(0);
    expect(rowById('root-a').tabIndex).toBe(-1);
    expect(document.activeElement).toBe(rowById('child-a1'));
  });

  it('Home/End jump to the first/last visible row', () => {
    rowById('child-a1').dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(rowById('root-c'));

    rowById('root-c').dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(rowById('root-a'));
  });

  it('ArrowLeft on a child moves focus to its parent', () => {
    rowById('child-a1').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(rowById('root-a'));
  });

  it('ArrowRight on an expanded parent moves focus to its first child', () => {
    rowById('root-a').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(rowById('child-a1'));
  });

  it('type-ahead jumps to the next visible node whose label starts with the typed letter', () => {
    rowById('root-a').dispatchEvent(new KeyboardEvent('keydown', { key: 'c' }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(rowById('root-c'));
  });

  it('display mode: click selects a node and sets aria-selected', () => {
    rowById('child-a1').click();
    fixture.detectChanges();

    expect(host.selected()).toBe('child-a1');
    expect(rowById('child-a1').getAttribute('aria-selected')).toBe('true');
    expect(rowById('root-b').getAttribute('aria-selected')).toBe('false');
  });

  it('display mode: Enter selects the focused node', () => {
    rowById('root-b').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(host.selected()).toBe('root-b');
  });

  it('disabled node is aria-disabled and ignores click', () => {
    const row = rowById('child-a2');
    expect(row.getAttribute('aria-disabled')).toBe('true');

    row.click();
    fixture.detectChanges();
    expect(host.selected()).toBeNull();
  });

  it('disabled node stays reachable by arrow navigation', () => {
    rowById('child-a1').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(rowById('child-a2'));
  });

  it('aria-level/aria-setsize/aria-posinset describe depth and position', () => {
    expect(rowById('root-a').getAttribute('aria-level')).toBe('1');
    expect(rowById('root-a').getAttribute('aria-setsize')).toBe('3');
    expect(rowById('root-a').getAttribute('aria-posinset')).toBe('1');
    expect(rowById('child-a2').getAttribute('aria-level')).toBe('2');
    expect(rowById('child-a2').getAttribute('aria-setsize')).toBe('2');
    expect(rowById('child-a2').getAttribute('aria-posinset')).toBe('2');
  });

  it('lazy node shows a spinner while loadChildren resolves, then renders the loaded children', async () => {
    const childrenPromise = Promise.resolve<KuiTreeNode[]>([{ id: 'lazy-1', label: 'Lazy child' }]);
    host.loadChildrenImpl = () => childrenPromise;

    rowById('root-c').querySelector<HTMLButtonElement>('.kui-tree-toggle')!.click();
    fixture.detectChanges();

    expect(rowById('root-c').querySelector('.kui-tree-spinner')).toBeTruthy();
    expect(host.expandedIds()).not.toContain('root-c');

    await childrenPromise;
    fixture.detectChanges();

    expect(rows().map((r) => r.dataset['nodeId'])).toContain('lazy-1');
    expect(host.expandedIds()).toContain('root-c');
  });

  describe('checkable mode', () => {
    beforeEach(() => {
      host.mode.set('checkable');
      fixture.detectChanges();
    });

    it('renders a checkbox per node', () => {
      expect(rowById('root-a').querySelector('.kui-checkbox')).toBeTruthy();
    });

    it('checking a leaf updates checkedIds and aria-checked', () => {
      rowById('child-a1').querySelector<HTMLInputElement>('.kui-checkbox')!.click();
      fixture.detectChanges();

      expect(host.checkedIds()).toContain('child-a1');
      expect(rowById('child-a1').getAttribute('aria-checked')).toBe('true');
    });

    it('checking a parent cascades to enabled children and leaves a disabled-descendant parent mixed', () => {
      rowById('root-a').querySelector<HTMLInputElement>('.kui-checkbox')!.click();
      fixture.detectChanges();

      expect(host.checkedIds()).toContain('child-a1');
      expect(host.checkedIds()).not.toContain('child-a2');
      expect(rowById('root-a').getAttribute('aria-checked')).toBe('mixed');
    });

    it('disabled node checkbox is disabled and unaffected by parent cascade', () => {
      const checkbox = rowById('child-a2').querySelector<HTMLInputElement>('.kui-checkbox')!;
      expect(checkbox.disabled).toBe(true);

      rowById('root-a').querySelector<HTMLInputElement>('.kui-checkbox')!.click();
      fixture.detectChanges();
      expect(host.checkedIds()).not.toContain('child-a2');
    });

    it('Space toggles the checkbox of the focused node', () => {
      rowById('child-a1').dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      fixture.detectChanges();
      expect(host.checkedIds()).toContain('child-a1');
    });
  });
});
