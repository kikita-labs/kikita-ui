import { Directive, computed, inject, input } from '@angular/core';

import { KUI_TABS_CONTEXT } from './kui-tabs-context.token';

/**
 * Tab panel inside a `kui-tabs` container.
 * Shown when its value matches the selected tab; hidden otherwise.
 *
 * @example
 * ```html
 * <div kuiTabPanel value="settings">Settings content</div>
 * ```
 */
@Directive({
  selector: '[kuiTabPanel]',
  host: {
    class: 'kui-tab-panel',
    role: 'tabpanel',
    '[hidden]': '!isActive()',
    '[attr.data-kui-active]': 'isActive() ? "" : null',
  },
})
export class KuiTabPanelDirective {
  /** Value that identifies this panel. Must match the corresponding kuiTab value. */
  readonly value = input<string>('');

  private readonly context = inject(KUI_TABS_CONTEXT);

  protected readonly isActive = computed(() => this.context.selected() === this.value());
}
