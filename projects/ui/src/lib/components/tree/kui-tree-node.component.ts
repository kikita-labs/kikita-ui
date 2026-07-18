import type { ElementRef } from '@angular/core';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

import {
  KUI_CHEVRON_RIGHT_D,
  KUI_FILE_D,
  KUI_FOLDER_D,
  KUI_FOLDER_OPEN_D,
} from '../../utils/kui-chrome-icon-paths.util';
import { KUI_TREE_CONTEXT } from './kui-tree-context.token';
import type { KuiTreeNode } from './kui-tree-node.interface';

/**
 * @internal Recursive row/group renderer for `kui-tree`. Reads all state and
 * behavior from the `KUI_TREE_CONTEXT` provided by an ancestor `kui-tree` and
 * is not meant to be placed outside one.
 */
@Component({
  selector: 'kui-tree-node',
  imports: [KuiTreeNodeComponent],
  template: `
    <div
      #row
      class="kui-tree-row"
      role="treeitem"
      [attr.data-node-id]="node().id"
      [attr.data-label]="node().label"
      [tabIndex]="active() ? 0 : -1"
      [attr.aria-level]="level()"
      [attr.aria-setsize]="setSize()"
      [attr.aria-posinset]="posInset()"
      [attr.aria-expanded]="hasChildren() ? expanded() : null"
      [attr.aria-selected]="ctx.mode() === 'display' ? selected() : null"
      [attr.aria-checked]="ctx.mode() === 'checkable' ? checkedState() : null"
      [attr.aria-disabled]="node().disabled ? 'true' : null"
      (click)="onRowClick()"
      (keydown)="onKeydown($event)"
    >
      @if (hasChildren()) {
        @if (loading()) {
          <span class="kui-tree-spinner" role="status" aria-label="Loading"></span>
        } @else {
          <button
            class="kui-field-action kui-tree-toggle"
            type="button"
            tabindex="-1"
            aria-hidden="true"
            [attr.aria-expanded]="expanded()"
            (click)="onToggleClick($event)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="${KUI_CHEVRON_RIGHT_D}"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        }
      } @else {
        <span class="kui-tree-toggle-spacer" aria-hidden="true"></span>
      }

      @if (ctx.mode() === 'checkable') {
        <input
          #checkbox
          class="kui-checkbox"
          type="checkbox"
          tabindex="-1"
          [checked]="checkedState() === 'true'"
          [disabled]="!!node().disabled"
          [attr.aria-label]="node().label"
          (click)="onCheckboxClick($event)"
        />
      }

      @if (node().icon === 'folder') {
        <span class="kui-tree-icon" aria-hidden="true">
          @if (expanded()) {
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="${KUI_FOLDER_OPEN_D}"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          } @else {
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="${KUI_FOLDER_D}"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          }
        </span>
      } @else if (node().icon === 'file') {
        <span class="kui-tree-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="${KUI_FILE_D[0]}"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="${KUI_FILE_D[1]}"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      }

      <span class="kui-tree-label">{{ node().label }}</span>
    </div>

    @if (expanded() && hasChildren()) {
      <div class="kui-tree-group" role="group">
        @for (child of children(); track child.id; let i = $index, c = $count) {
          <kui-tree-node [node]="child" [level]="level() + 1" [setSize]="c" [posInset]="i + 1" />
        }
      </div>
    }
  `,
  encapsulation: ViewEncapsulation.None,
})
/** Renders one interactive row in a Kikita UI tree. */
export class KuiTreeNodeComponent {
  /** Node data rendered by this row. */
  readonly node = input.required<KuiTreeNode>();
  /** 1-based tree depth, mirrored to `aria-level`. */
  readonly level = input.required<number>();
  /** Number of sibling nodes at this level, mirrored to `aria-setsize`. */
  readonly setSize = input.required<number>();
  /** 1-based position among siblings, mirrored to `aria-posinset`. */
  readonly posInset = input.required<number>();

  protected readonly ctx = inject(KUI_TREE_CONTEXT);

  protected readonly hasChildren = computed(() => this.ctx.hasChildren(this.node()));
  protected readonly children = computed(() => this.ctx.childrenFor(this.node()));
  protected readonly expanded = computed(() => this.ctx.isExpanded(this.node().id));
  protected readonly loading = computed(() => this.ctx.isLoading(this.node().id));
  protected readonly active = computed(() => this.ctx.isActive(this.node().id));
  protected readonly selected = computed(() => this.ctx.isSelected(this.node().id));
  protected readonly checkedState = computed(() => this.ctx.checkedState(this.node()));

  private readonly checkboxRef = viewChild<ElementRef<HTMLInputElement>>('checkbox');

  constructor() {
    effect(() => {
      const el = this.checkboxRef()?.nativeElement;
      if (el) el.indeterminate = this.checkedState() === 'mixed';
    });
  }

  protected onRowClick(): void {
    this.ctx.onRowClick(this.node());
  }

  protected onToggleClick(event: Event): void {
    this.ctx.onToggleClick(this.node(), event);
  }

  protected onCheckboxClick(event: Event): void {
    this.ctx.onCheckboxClick(this.node(), event);
  }

  protected onKeydown(event: KeyboardEvent): void {
    this.ctx.onKeydown(event, this.node());
  }
}
