import { Directive } from '@angular/core';

/**
 * Marks projected content as a custom Alert message body, replacing the plain `message` string
 * input. Use this when the message needs rich markup (links, lists, inline formatting) instead of
 * plain text.
 *
 * @example
 * ```html
 * <kui-alert appearance="danger" title="Upload failed">
 *   <p kuiAlertMessage>
 *     Check your connection and <a href="/retry">try again</a>.
 *   </p>
 * </kui-alert>
 * ```
 */
@Directive({
  selector: '[kuiAlertMessage]',
  host: {
    class: 'kui-alert__message',
  },
})
export class KuiAlertMessageDirective {}
