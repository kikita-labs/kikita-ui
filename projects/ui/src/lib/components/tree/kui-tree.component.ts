import {
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';

import { KuiSize } from '../../types';
import { KUI_TREE_CONTEXT, KuiTreeCheckedState, KuiTreeContext } from './kui-tree-context.token';
import { KuiTreeMode, KuiTreeNode } from './kui-tree-node.interface';
import { KuiTreeNodeComponent } from './kui-tree-node.component';

interface KuiTreeFlatEntry {
  readonly id: string;
  readonly label: string;
}

interface KuiTreeIndex {
  readonly flat: readonly KuiTreeFlatEntry[];
  readonly parents: ReadonlyMap<string, string | null>;
}

/**
 * Hierarchical navigation/selection list with expandable nodes.
 *
 * Supports `display` mode (single-selection navigation; click or Enter selects
 * a node) and `checkable` mode (a checkbox per node with indeterminate
 * cascading), lazy-loaded children via `loadChildren`, and roving-tabindex
 * keyboard navigation (arrow keys, Home/End, type-ahead).
 *
 * @example
 * ```html
 * <kui-tree ariaLabel="Project explorer" [data]="nodes" [(selected)]="selectedId" />
 * ```
 */
@Component({
  selector: 'kui-tree',
  imports: [KuiTreeNodeComponent],
  template: `
    @for (root of data(); track root.id; let i = $index, c = $count) {
      <kui-tree-node [node]="root" [level]="1" [setSize]="c" [posInset]="i + 1" />
    }
  `,
  host: {
    class: 'kui-tree-container',
    role: 'tree',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-multiselectable]': "mode() === 'checkable' ? 'true' : null",
    '[attr.data-kui-size]': 'size()',
    '[attr.data-kui-mobile]': "mobile() ? '' : null",
  },
  providers: [{ provide: KUI_TREE_CONTEXT, useFactory: () => inject(KuiTreeComponent) }],
  encapsulation: ViewEncapsulation.None,
})
/** Renders hierarchical data with roving focus, selection, and optional checkbox state. */
export class KuiTreeComponent implements KuiTreeContext {
  /** Selection/toggle behavior. */
  readonly mode = input<KuiTreeMode>('display');

  /** Row height and text size. */
  readonly size = input<KuiSize>('md');

  /** Root nodes of the tree. */
  readonly data = input<readonly KuiTreeNode[]>([]);

  /** Accessible name for the `role="tree"` container. */
  readonly ariaLabel = input('Tree');

  /** Enlarges the toggle tap target to 44px for touch/mobile layouts. */
  readonly mobile = input(false, { transform: booleanAttribute });

  /** Controlled id of the selected node (`display` mode). Supports two-way binding. */
  readonly selected = model<string | null>(null);

  /** Controlled set of checked node ids (`checkable` mode). Supports two-way binding. */
  readonly checkedIds = model<string[]>([]);

  /** Controlled set of expanded node ids. Supports two-way binding. */
  readonly expandedIds = model<string[]>([]);

  /** Lazily loads children for a `lazy` node the first time it's expanded. */
  readonly loadChildren = input<
    ((node: KuiTreeNode) => Promise<readonly KuiTreeNode[]>) | undefined
  >();

  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly loadedChildren = signal<ReadonlyMap<string, readonly KuiTreeNode[]>>(new Map());
  private readonly loadingIds = signal<ReadonlySet<string>>(new Set());
  private readonly focusedId = signal<string | null>(null);

  private readonly index = computed<KuiTreeIndex>(() => {
    const flat: KuiTreeFlatEntry[] = [];
    const parents = new Map<string, string | null>();

    const walk = (nodes: readonly KuiTreeNode[], parentId: string | null): void => {
      for (const node of nodes) {
        flat.push({ id: node.id, label: node.label });
        parents.set(node.id, parentId);
        if (this.isExpanded(node.id) && this.hasChildren(node)) {
          walk(this.childrenFor(node), node.id);
        }
      }
    };
    walk(this.data(), null);

    return { flat, parents };
  });

  private readonly activeId = computed(() => this.focusedId() ?? this.index().flat[0]?.id ?? null);

  hasChildren(node: KuiTreeNode): boolean {
    if (node.lazy && !this.isLoaded(node.id)) return true;
    return this.childrenFor(node).length > 0;
  }

  childrenFor(node: KuiTreeNode): readonly KuiTreeNode[] {
    return this.loadedChildren().get(node.id) ?? node.children ?? [];
  }

  isExpanded(id: string): boolean {
    return this.expandedIds().includes(id);
  }

  isLoading(id: string): boolean {
    return this.loadingIds().has(id);
  }

  isSelected(id: string): boolean {
    return this.mode() === 'display' && this.selected() === id;
  }

  isActive(id: string): boolean {
    return this.activeId() === id;
  }

  checkedState(node: KuiTreeNode): KuiTreeCheckedState {
    const kids = this.childrenFor(node);
    if (!kids.length) {
      return this.checkedIds().includes(node.id) ? 'true' : 'false';
    }
    const states = kids.map((child) => this.checkedState(child));
    if (states.every((s) => s === 'true')) return 'true';
    if (states.every((s) => s === 'false')) return 'false';
    return 'mixed';
  }

  onRowClick(node: KuiTreeNode): void {
    if (node.disabled) return;
    this.focusedId.set(node.id);
    if (this.mode() === 'display') {
      this.selected.set(node.id);
    } else {
      this.toggleCheck(node);
    }
  }

  onToggleClick(node: KuiTreeNode, event: Event): void {
    event.stopPropagation();
    this.expandOrLoad(node);
  }

  onCheckboxClick(node: KuiTreeNode, event: Event): void {
    event.stopPropagation();
    if (node.disabled) return;
    this.toggleCheck(node);
  }

  onKeydown(event: KeyboardEvent, node: KuiTreeNode): void {
    const { flat, parents } = this.index();
    const idx = flat.findIndex((entry) => entry.id === node.id);
    if (idx === -1) return;

    const expanded = this.isExpanded(node.id);
    const hasKids = this.hasChildren(node);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusAt(Math.min(idx + 1, flat.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusAt(Math.max(idx - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        this.focusAt(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusAt(flat.length - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (hasKids) {
          if (!expanded) this.expandOrLoad(node);
          else this.focusAt(idx + 1);
        }
        break;
      case 'ArrowLeft': {
        event.preventDefault();
        if (hasKids && expanded) {
          this.collapse(node.id);
        } else {
          const parentId = parents.get(node.id) ?? null;
          const parentIdx = parentId ? flat.findIndex((entry) => entry.id === parentId) : -1;
          if (parentIdx !== -1) this.focusAt(parentIdx);
        }
        break;
      }
      case 'Enter':
        if (this.mode() === 'display' && !node.disabled) this.selected.set(node.id);
        break;
      case ' ':
        event.preventDefault();
        if (node.disabled) break;
        if (this.mode() === 'checkable') this.toggleCheck(node);
        else if (hasKids) this.expandOrLoad(node);
        break;
      default:
        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
          this.typeahead(event.key, idx);
        }
    }
  }

  private expandOrLoad(node: KuiTreeNode): void {
    if (node.lazy && !this.isLoaded(node.id)) {
      void this.loadNode(node);
      return;
    }
    this.isExpanded(node.id) ? this.collapse(node.id) : this.expand(node.id);
  }

  private expand(id: string): void {
    if (this.isExpanded(id)) return;
    this.expandedIds.set([...this.expandedIds(), id]);
  }

  private collapse(id: string): void {
    this.expandedIds.set(this.expandedIds().filter((x) => x !== id));
  }

  private isLoaded(id: string): boolean {
    return this.loadedChildren().has(id);
  }

  private async loadNode(node: KuiTreeNode): Promise<void> {
    const fn = this.loadChildren();
    if (!fn || this.isLoading(node.id) || this.isLoaded(node.id)) return;

    this.loadingIds.set(new Set(this.loadingIds()).add(node.id));
    try {
      const children = await fn(node);
      const nextLoaded = new Map(this.loadedChildren());
      nextLoaded.set(node.id, children);
      this.loadedChildren.set(nextLoaded);
      this.expand(node.id);
    } finally {
      const nextLoading = new Set(this.loadingIds());
      nextLoading.delete(node.id);
      this.loadingIds.set(nextLoading);
    }
  }

  private toggleCheck(node: KuiTreeNode): void {
    if (node.disabled) return;
    const nextChecked = this.checkedState(node) !== 'true';
    const ids = new Set(this.checkedIds());

    const cascade = (n: KuiTreeNode): void => {
      if (!n.disabled) {
        nextChecked ? ids.add(n.id) : ids.delete(n.id);
      }
      for (const child of this.childrenFor(n)) cascade(child);
    };
    cascade(node);

    this.checkedIds.set([...ids]);
  }

  private focusAt(position: number): void {
    const entry = this.index().flat[position];
    if (!entry) return;
    this.focusedId.set(entry.id);
    this.focusRow(entry.id);
  }

  private typeahead(letter: string, fromIndex: number): void {
    const { flat } = this.index();
    const target = letter.toLowerCase();
    for (let step = 1; step <= flat.length; step++) {
      const i = (fromIndex + step) % flat.length;
      if (flat[i].label.toLowerCase().startsWith(target)) {
        this.focusAt(i);
        return;
      }
    }
  }

  private focusRow(id: string): void {
    const candidates = this.hostEl.nativeElement.querySelectorAll<HTMLElement>('[data-node-id]');
    for (const candidate of candidates) {
      if (candidate.dataset['nodeId'] === id) {
        candidate.focus();
        return;
      }
    }
  }
}
