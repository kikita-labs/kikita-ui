import {
  afterRenderEffect,
  booleanAttribute,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';

import type { KuiSize } from '../../types';
import { injectKuiRootSizeDefault } from '../../utils/kui-defaults.util';
import type { KuiGroupOrientation } from './kui-group-orientation.type';

/** Groups adjacent Kikita UI controls and can collapse their shared borders. */
@Directive({
  selector: '[kuiGroup]',
  host: {
    class: 'kui-group',
    '[attr.data-kui-orientation]': 'orientation()',
    '[attr.data-kui-size]': 'effectiveSize()',
    '[attr.data-kui-collapsed]': 'collapsed() ? "" : null',
    '[attr.data-kui-rounded]': 'rounded() ? "" : null',
    '[style.grid-template-columns]': 'fieldColumns()',
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
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly effectiveSize = computed(() => this.size() ?? this.rootDefaultSize ?? 'md');

  /**
   * Explicit column track list for the horizontal field-mode grid (see `group.css`), covering any
   * mix and count of `kui-field`s and plain buttons/inputs: every `kui-field` column gets
   * `minmax(0, 1fr)` so it shares the group's free width, every other column stays `auto`
   * (content-sized). A single static `grid-template-columns` can't express that split for
   * implicit auto-flow columns -- `grid-auto-columns` sizes every generated track the same way,
   * and there's no selector that reaches "the Nth column" without also matching a fixed child
   * arrangement. Reading real DOM children instead of counting `kui-field`s up front means order,
   * count, and mix (all fields, all buttons, or any interleaving, including zero fields) all fall
   * out of the same loop; a trailing `auto` (rather than continuing the explicit list) leaves any
   * columns after the last field on the container's implicit `auto` sizing, so unused explicit
   * tracks never appear and never eat a `gap` for content that isn't there.
   */
  protected readonly fieldColumns = signal<string | null>(null);

  constructor() {
    afterRenderEffect(() => {
      const children = Array.from(this.elementRef.nativeElement.children) as HTMLElement[];
      let lastFieldIndex = -1;
      const tracks = children.map((child, index) => {
        if (!child.classList.contains('kui-field')) return 'auto';
        lastFieldIndex = index;
        return 'minmax(0, 1fr)';
      });

      this.fieldColumns.set(
        lastFieldIndex === -1 ? null : tracks.slice(0, lastFieldIndex + 1).join(' '),
      );
    });
  }
}
