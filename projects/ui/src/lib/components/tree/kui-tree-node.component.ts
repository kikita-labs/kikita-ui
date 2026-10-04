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

import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import { KuiDefaults } from '../../providers/kui-defaults.service';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import {
  KUI_GLYPH_CHEVRON_RIGHT,
  KUI_GLYPH_FILE,
  KUI_GLYPH_FOLDER,
  KUI_GLYPH_FOLDER_OPEN,
} from '../icon/kui-chrome-glyphs';
import { KuiGlyph } from '../icon/kui-glyph.component';
import { KUI_TREE_CONTEXT } from './kui-tree-context.token';
import type { KuiTreeNode } from './kui-tree-node.interface';

/**
 * @internal Recursive row/group renderer for `kui-tree`. Reads all state and
 * behavior from the `KUI_TREE_CONTEXT` provided by an ancestor `kui-tree` and
 * is not meant to be placed outside one.
 */
@Component({
  selector: 'kui-tree-node',
  imports: [KuiTreeRow, KuiGlyph],
  templateUrl: './kui-tree-node.component.html',
  encapsulation: ViewEncapsulation.None,
})
/** Renders one interactive row in a Kikita UI tree. */
export class KuiTreeRow {
  private readonly treeDefaults = inject(KuiDefaults).get('tree');
  protected readonly common = injectKuiMessages('common');

  protected readonly disclosureGlyph = injectKuiGlyph({
    role: 'disclosure',
    slot: () => this.treeDefaults()?.disclosureIcon,
    fallback: KUI_GLYPH_CHEVRON_RIGHT,
  });

  protected readonly folderGlyph = KUI_GLYPH_FOLDER;
  protected readonly folderOpenGlyph = KUI_GLYPH_FOLDER_OPEN;
  protected readonly fileGlyph = KUI_GLYPH_FILE;

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
