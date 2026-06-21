import { Directive, ElementRef, computed, inject, input } from '@angular/core';

import { KUI_TABS_CONTEXT } from './kui-tabs-context.token';

/**
 * Tab trigger inside a `kui-tabs` container.
 * Use on `<button>` elements projected into `kui-tabs`.
 *
 * @example
 * ```html
 * <button kuiTab value="settings">Settings</button>
 * ```
 */
@Directive({
  selector: '[kuiTab]',
  host: {
    class: 'kui-tab',
    role: 'tab',
    type: 'button',
    '[attr.aria-selected]': 'isSelected()',
    '[attr.tabindex]': 'isSelected() ? 0 : -1',
    '[attr.data-kui-selected]': 'isSelected() ? "" : null',
    '(click)': 'select()',
  },
})
export class KuiTabDirective {
  /** Value that identifies this tab. Must match the corresponding kuiTabPanel value. */
  readonly value = input<string>('');

  private readonly context = inject(KUI_TABS_CONTEXT);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly isSelected = computed(() => this.context.selected() === this.value());

  /** @internal */
  select(): void {
    this.context.select(this.value());
  }

  /** @internal */
  focusTab(): void {
    this.el.nativeElement.focus();
  }
}
