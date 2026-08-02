import { Directive, ElementRef, HostListener, inject } from '@angular/core';

/**
 * @internal Shared with `kui-field`'s own click handler -- `kui-field` toggles this chrome via a
 * `[class.kui-input-group]` property binding, which Angular's directive matcher does not pick up
 * (class-selector directives only match a *static* `class="..."` string present in the template,
 * not a property binding, even when the bound value is always the same expression). This
 * directive's own `.kui-input-group` selector therefore never attaches to `kui-field`'s control
 * slot; `kui-field` re-implements the same focus delegation directly using these selectors so the
 * dynamically-toggled case still works. Kept exported so both stay in lockstep.
 */
export const KUI_INPUT_GROUP_INTERACTIVE_SELECTOR = [
  'button',
  'a[href]',
  'input',
  'select',
  'textarea',
  '[contenteditable="true"]',
  '[role="button"]',
  '[role="link"]',
].join(',');

/** @internal See {@link KUI_INPUT_GROUP_INTERACTIVE_SELECTOR}. */
export const KUI_INPUT_GROUP_CONTROL_SELECTOR = [
  'input:not(:disabled)',
  'textarea:not(:disabled)',
  'select:not(:disabled)',
].join(',');

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
export class KuiInputGroupDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  @HostListener('click', ['$event'])
  protected handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;

    if (!target || target.closest(KUI_INPUT_GROUP_INTERACTIVE_SELECTOR)) {
      return;
    }

    const control = this.host.nativeElement.querySelector<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >(KUI_INPUT_GROUP_CONTROL_SELECTOR);

    control?.focus();
  }
}
