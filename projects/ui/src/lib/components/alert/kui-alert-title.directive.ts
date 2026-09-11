import { Directive } from '@angular/core';

/**
 * Marks projected content as a custom Alert title, replacing the plain `title` string input. Use
 * this when the title needs rich markup (a badge, an icon, inline formatting) instead of plain
 * text.
 *
 * @example
 * ```html
 * <kui-alert appearance="warning" message="Renews automatically.">
 *   <span kuiAlertTitle>Plan expiring <span kuiBadge appearance="warning">5 days</span></span>
 * </kui-alert>
 * ```
 */
@Directive({
  selector: '[kuiAlertTitle]',
  host: {
    class: 'kui-alert__title',
  },
})
export class KuiAlertTitleDirective {}
