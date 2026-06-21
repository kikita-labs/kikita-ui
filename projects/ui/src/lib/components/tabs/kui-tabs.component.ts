import {
  Component,
  ViewEncapsulation,
  contentChildren,
  inject,
  input,
  model,
} from '@angular/core';

import { KuiSize } from '../../types';
import { KuiTabDirective } from './kui-tab.directive';
import { KUI_TABS_CONTEXT, KuiTabsContext } from './kui-tabs-context.token';

export type KuiTabsVariant = 'line' | 'pill';

/**
 * Tabs container. Manages selected state and keyboard navigation.
 * Projects `[kuiTab]` into the tablist and `[kuiTabPanel]` below it.
 *
 * @example
 * ```html
 * <kui-tabs selected="general">
 *   <button kuiTab value="general">General</button>
 *   <button kuiTab value="advanced">Advanced</button>
 *   <div kuiTabPanel value="general">General settings</div>
 *   <div kuiTabPanel value="advanced">Advanced settings</div>
 * </kui-tabs>
 * ```
 */
@Component({
  selector: 'kui-tabs',
  template: `
    <div class="kui-tabs__scroll">
      <div class="kui-tabs__list" role="tablist" (keydown)="onKeydown($event)">
        <ng-content select="[kuiTab]" />
      </div>
    </div>
    <ng-content select="[kuiTabPanel]" />
  `,
  host: {
    class: 'kui-tabs',
    '[attr.data-kui-variant]': 'variant()',
    '[attr.data-kui-size]': 'size()',
  },
  providers: [
    {
      provide: KUI_TABS_CONTEXT,
      useFactory: () => inject(KuiTabsComponent),
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class KuiTabsComponent implements KuiTabsContext {
  /** Tab visual style: underline indicator (line) or pill background (pill). */
  readonly variant = input<KuiTabsVariant>('line');
  /** Tab size. Defaults to md. */
  readonly size = input<KuiSize>('md');
  /** Currently selected tab value. */
  readonly selected = model<string>('');

  private readonly tabItems = contentChildren(KuiTabDirective);

  select(value: string): void {
    this.selected.set(value);
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    const tabs = this.tabItems();
    if (!tabs.length) return;

    const idx = tabs.findIndex((t) => t.value() === this.selected());

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        tabs[(idx + 1) % tabs.length].focusTab();
        tabs[(idx + 1) % tabs.length].select();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        tabs[(idx - 1 + tabs.length) % tabs.length].focusTab();
        tabs[(idx - 1 + tabs.length) % tabs.length].select();
        break;
      case 'Home':
        event.preventDefault();
        tabs[0].focusTab();
        tabs[0].select();
        break;
      case 'End':
        event.preventDefault();
        tabs[tabs.length - 1].focusTab();
        tabs[tabs.length - 1].select();
        break;
    }
  }
}
