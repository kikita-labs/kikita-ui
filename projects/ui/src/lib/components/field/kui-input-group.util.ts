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
 * @internal
 * Focuses the first enabled text control of an input-group container when a click landed on the
 * group's own padding rather than on one of its interactive children. Shared by `kui-field`'s
 * auto-applied group chrome and by the hand-written `.kui-input-group` directive.
 */
export function focusInputGroupControl(group: HTMLElement, target: Element | null): void {
  if (!target || target.closest(KUI_INPUT_GROUP_INTERACTIVE_SELECTOR)) {
    return;
  }

  group
    .querySelector<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >(KUI_INPUT_GROUP_CONTROL_SELECTOR)
    ?.focus();
}
