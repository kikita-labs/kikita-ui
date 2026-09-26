import { Component, computed, input } from '@angular/core';

import { KuiTextDirective, KuiTreeComponent } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';
import type { KuiTreeNode } from '@kikita-labs/ui';

import { TREE_SIZES } from '../../constants';

/** Renders Tree size examples, including the mobile tap-target comparison. */
@Component({
  selector: 'app-tree-size-examples',
  imports: [KuiTextDirective, KuiTreeComponent, TranslocoPipe],
  templateUrl: './tree-size-examples.html',
  styleUrl: './tree-size-examples.scss',
})
export class TreeSizeExamples {
  readonly data = input.required<readonly KuiTreeNode[]>();
  readonly mobile = input(false);

  protected readonly sizes = computed(() => (this.mobile() ? (['md'] as const) : TREE_SIZES));
}
