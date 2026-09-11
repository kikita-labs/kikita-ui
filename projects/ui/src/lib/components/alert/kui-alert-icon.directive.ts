import { Directive } from '@angular/core';

/**
 * Marks projected content as a custom Alert icon, replacing the built-in severity icon.
 *
 * Unlike the built-in icon (hidden for `neutral` and governed by `showIcon`), a projected icon
 * always renders regardless of `appearance`/`showIcon` -- an explicit custom icon is always
 * intentional.
 *
 * @example
 * ```html
 * <kui-alert appearance="info" title="Deploy started">
 *   <kui-icon kuiAlertIcon name="rocket" />
 * </kui-alert>
 * ```
 */
@Directive({
  selector: '[kuiAlertIcon]',
  host: {
    class: 'kui-alert__icon',
    'aria-hidden': 'true',
    // Inline style wins over any stylesheet rule regardless of CSS layers, so a projected
    // <kui-icon>'s own unlayered `:host { color: inherit }` never shadows the intended tint --
    // see kui-alert.component.ts's built-in icon for the same fix on the same root cause.
    '[style.color]': "'var(--kui-alert-icon-color, currentColor)'",
  },
})
export class KuiAlertIconDirective {}
