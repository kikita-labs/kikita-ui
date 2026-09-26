import { Component, computed, input } from '@angular/core';

import {
  KuiTabDirective,
  KuiTabPanelDirective,
  KuiTabsComponent,
  KuiTextDirective,
} from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';
import type { KuiTabsOrientation, KuiTabsVariant } from '@kikita-labs/ui';

interface TabsMatrixExample {
  readonly id: string;
  readonly size: 'xs' | 'sm' | 'md' | 'lg';
  readonly variant: KuiTabsVariant;
  readonly orientation: KuiTabsOrientation;
  readonly inverted: boolean;
}

const sizes = ['xs', 'sm', 'md', 'lg'] as const;
const variants = ['line', 'pill'] as const satisfies readonly KuiTabsVariant[];

/** Renders one exhaustive size and variant matrix for an orientation and edge. */
@Component({
  selector: 'app-tabs-style-matrix',
  imports: [
    KuiTabDirective,
    KuiTabPanelDirective,
    KuiTabsComponent,
    KuiTextDirective,
    TranslocoPipe,
  ],
  templateUrl: './tabs-style-matrix.html',
  styleUrl: './tabs-style-matrix.scss',
})
export class TabsStyleMatrix {
  readonly orientation = input<KuiTabsOrientation>('horizontal');
  readonly inverted = input(false);

  protected readonly examples = computed<TabsMatrixExample[]>(() =>
    sizes.flatMap((size) =>
      variants.map((variant) => ({
        id: `${this.orientation()}-${variant}-${size}-${this.inverted() ? 'inverted' : 'normal'}`,
        size,
        variant,
        orientation: this.orientation(),
        inverted: this.inverted(),
      })),
    ),
  );
}
