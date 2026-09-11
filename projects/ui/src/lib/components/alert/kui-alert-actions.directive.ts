import { Directive } from '@angular/core';

/**
 * Marks projected content as a custom Alert actions area, replacing the single ghost `actionLabel`
 * button. Use this for more than one action, a non-ghost/non-`kuiButton` control, or a link.
 *
 * @example
 * ```html
 * <kui-alert appearance="warning" title="Unsaved changes">
 *   <div kuiAlertActions>
 *     <button kuiButton shape="ghost" size="xs" (click)="discard()">Discard</button>
 *     <button kuiButton shape="ghost" size="xs" (click)="save()">Save</button>
 *   </div>
 * </kui-alert>
 * ```
 */
@Directive({
  selector: '[kuiAlertActions]',
  host: {
    class: 'kui-alert__actions',
  },
})
export class KuiAlertActionsDirective {}
