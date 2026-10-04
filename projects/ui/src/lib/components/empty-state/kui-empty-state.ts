import { Component, computed, inject, input, ViewEncapsulation } from '@angular/core';

import { KuiDefaults } from '../../providers/kui-defaults';
import { injectKuiRootSizeDefault } from '../../providers/kui-defaults.util';
import type { KuiEmptyStateContext } from './kui-empty-state-context.type';
import type { KuiEmptyStateSize } from './kui-empty-state-size.type';

const KUI_EMPTY_STATE_SIZES = ['sm', 'md', 'lg'] as const;

/** Displays a non-blocking empty, error, no-access, or success state for known UI regions. */
@Component({
  selector: 'kui-empty-state',
  templateUrl: './kui-empty-state.html',
  host: {
    class: 'kui-empty',
    '[attr.data-kui-context]': 'context()',
    '[attr.data-kui-size]': 'effectiveSize()',
  },
  encapsulation: ViewEncapsulation.None,
})
export class KuiEmptyState {
  /** Empty-state heading text. Omit when the supporting description is sufficient. */
  readonly heading = input<string | undefined>();

  /** Optional supporting description text. */
  readonly description = input<string | null>(null);

  /** Semantic context that changes the icon accent only. */
  readonly context = input<KuiEmptyStateContext>('no-data');

  /** Empty-state layout size. Small uses a compact horizontal layout. Defaults to `defaults.emptyState.size`, then the global `defaults.size`, then md. */
  readonly size = input<KuiEmptyStateSize | undefined>();

  private readonly emptyStateDefaults = inject(KuiDefaults).get('emptyState');
  private readonly rootDefaultSize =
    injectKuiRootSizeDefault<KuiEmptyStateSize>(KUI_EMPTY_STATE_SIZES);

  private readonly configuredSize = computed(() => {
    const size = this.emptyStateDefaults()?.size;

    return size && KUI_EMPTY_STATE_SIZES.includes(size) ? size : undefined;
  });

  protected readonly effectiveSize = computed(
    () => this.size() ?? this.configuredSize() ?? this.rootDefaultSize() ?? 'md',
  );
}
