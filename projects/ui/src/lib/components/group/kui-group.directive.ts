import { Directive, booleanAttribute, computed, input } from '@angular/core';

import { KuiSize } from '../../types';
import { injectKuiRootSizeDefault } from '../../utils/kui-defaults.util';
import { KuiGroupOrientation } from './kui-group-orientation.type';

/** Groups adjacent Kikita UI controls and can collapse their shared borders. */
@Directive({
  selector: '[kuiGroup]',
  host: {
    class: 'kui-group',
    '[attr.data-kui-orientation]': 'orientation()',
    '[attr.data-kui-size]': 'effectiveSize()',
    '[attr.data-kui-collapsed]': 'collapsed() ? "" : null',
    '[attr.data-kui-rounded]': 'rounded() ? "" : null',
  },
})
export class KuiGroupDirective {
  /** Group layout direction. */
  readonly orientation = input<KuiGroupOrientation>('horizontal');

  /** Size inherited by grouped controls through CSS variables. */
  readonly size = input<KuiSize | undefined>();

  /** Collapses adjacent control borders into a single visual group. */
  readonly collapsed = input(false, { transform: booleanAttribute });

  /** Keeps outer group corners rounded when controls are collapsed. */
  readonly rounded = input(true, { transform: booleanAttribute });

  private readonly rootDefaultSize = injectKuiRootSizeDefault();

  protected readonly effectiveSize = computed(() => this.size() ?? this.rootDefaultSize ?? 'md');
}
