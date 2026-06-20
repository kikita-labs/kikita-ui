import { Directive, ElementRef, booleanAttribute, computed, inject, input } from '@angular/core';

import { KuiSize } from '../../types';
import { KuiButtonAppearance } from '../button';

/** Applies square Kikita UI icon button styling to native button and anchor elements. */
@Directive({
  selector: 'button[kuiIconButton], a[kuiIconButton]',
  host: {
    class: 'kui-icon-button',
    '[attr.data-kui-appearance]': 'normalizedAppearance()',
    '[attr.data-kui-size]': 'size()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.disabled]': 'nativeDisabledAttribute()',
    '[attr.tabindex]': 'disabled() ? "-1" : null',
    '(click)': 'handleClick($event)',
  },
})
export class KuiIconButtonDirective {
  /** Visual icon button treatment. */
  readonly appearance = input<KuiButtonAppearance>('ghost');

  /** Icon button size mapped to Kikita UI control height tokens. */
  readonly size = input<KuiSize>('md');

  /** Disables the icon button host and removes anchor icon buttons from tab order. */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly normalizedAppearance = computed(() => {
    const appearance = this.appearance();

    if (appearance === 'primary') {
      return 'solid';
    }

    if (appearance === 'secondary') {
      return 'soft';
    }

    return appearance;
  });

  protected readonly nativeDisabledAttribute = computed(() =>
    this.disabled() && this.host.tagName.toLowerCase() === 'button' ? '' : null,
  );

  protected handleClick(event: Event): void {
    if (!this.disabled()) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
  }
}
