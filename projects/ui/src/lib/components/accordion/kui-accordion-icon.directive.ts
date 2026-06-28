import { Directive } from '@angular/core';

/**
 * Marker directive for the optional icon slot in a `kui-accordion-item` trigger.
 * Apply to an `ng-template` inside `kui-accordion-item`.
 *
 * @example
 * ```html
 * <kui-accordion-item header="Settings">
 *   <ng-template kuiAccordionIcon><kui-icon name="settings" /></ng-template>
 *   Body content
 * </kui-accordion-item>
 * ```
 */
@Directive({ selector: 'ng-template[kuiAccordionIcon]' })
export class KuiAccordionIconDirective {}
