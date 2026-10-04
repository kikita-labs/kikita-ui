import { Directive, ElementRef, HostListener, inject } from '@angular/core';

import {
  focusInputGroupControl,
  KUI_INPUT_GROUP_CONTROL_SELECTOR,
  KUI_INPUT_GROUP_INTERACTIVE_SELECTOR,
} from '../field/kui-input-group.util';

export { KUI_INPUT_GROUP_CONTROL_SELECTOR, KUI_INPUT_GROUP_INTERACTIVE_SELECTOR };

/**
 * Adds focus delegation behavior to a `.kui-input-group` field chrome container written by hand
 * (a static `class="kui-input-group"` in your own template). `kui-field`'s own auto-applied
 * `.kui-input-group` chrome (from detected `kuiFieldAffix` / `kuiFieldAffixIcon` /
 * `kuiFieldAction` content) does NOT go through this directive -- see the note on
 * {@link KUI_INPUT_GROUP_INTERACTIVE_SELECTOR} -- `kui-field` handles that case itself.
 */
@Directive({
  selector: '.kui-input-group',
})
export class KuiInputGroup {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  @HostListener('click', ['$event'])
  protected handleClick(event: MouseEvent): void {
    focusInputGroupControl(this.host.nativeElement, event.target as HTMLElement | null);
  }
}
