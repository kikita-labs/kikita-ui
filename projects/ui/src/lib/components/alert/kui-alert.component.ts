import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';

import {
  KUI_CIRCLE_CHECK_CIRCLE,
  KUI_CIRCLE_CHECK_D,
  KUI_CIRCLE_X_CIRCLE,
  KUI_CIRCLE_X_D,
  KUI_INFO_CIRCLE,
  KUI_INFO_DOT_D,
  KUI_INFO_LINE_D,
  KUI_TRIANGLE_ALERT_D,
  KUI_X_D,
} from '../../utils/kui-chrome-icon-paths.util';
import { injectKuiRootSizeDefault } from '../../utils/kui-defaults.util';
import { KuiButtonDirective } from '../button';
import { KuiIconButtonDirective } from '../icon-button';
import { KuiAlertActionsDirective } from './kui-alert-actions.directive';
import type { KuiAlertAppearance } from './kui-alert-appearance.type';
import { KuiAlertIconDirective } from './kui-alert-icon.directive';
import { KuiAlertMessageDirective } from './kui-alert-message.directive';
import type { KuiAlertShape } from './kui-alert-shape.type';
import type { KuiAlertSize } from './kui-alert-size.type';
import { KuiAlertTitleDirective } from './kui-alert-title.directive';

const KUI_ALERT_SIZES: readonly KuiAlertSize[] = ['sm', 'md'];

/**
 * Inline notification embedded in the page content flow.
 *
 * Unlike `kuiToast()`, `kui-alert` does not float above the interface, does not self-dismiss on a
 * timer, and does not require a `document.body` region -- it renders directly in the surrounding
 * content. It is a controlled component: closing it is the consumer's responsibility. `kui-alert`
 * only emits `(closed)` when the close button is clicked; removing it from the DOM (e.g. from an
 * `@if` bound to a signal) is up to the caller, the same pattern `[kuiChip]`'s `(removed)` uses.
 *
 * `title`/`message`/`actionLabel` cover the common plain-text case. For richer content, project
 * `[kuiAlertTitle]`, `[kuiAlertIcon]`, `[kuiAlertMessage]`, or `[kuiAlertActions]` instead -- the
 * same shorthand-input-or-projected-content pattern `kui-empty-state` uses for its icon/actions
 * slots. A projected slot always takes over its area entirely; it is not merged with the matching
 * input.
 *
 * At least one of `title`/`message`/a projected `[kuiAlertMessage]` should be set. `neutral` never
 * shows the *built-in* icon regardless of `showIcon`, matching `kuiToast()`'s severity mapping --
 * a projected `[kuiAlertIcon]` always renders, since an explicit custom icon is always intentional.
 * The built-in severity icon and the close glyph are inline SVGs built from
 * `kui-chrome-icon-paths.util` -- the same synchronous, SSR-safe pattern `kuiToast()` uses for its
 * own chrome -- instead of the async, name-resolved `kui-icon`, so they never depend on a network
 * fetch or wait past hydration to appear.
 *
 * @example
 * ```html
 * <kui-alert
 *   appearance="warning"
 *   title="Session expiring"
 *   message="Your access token expires in 3 days."
 *   actionLabel="Renew"
 *   (action)="renewSession()"
 *   (closed)="dismissed.set(true)"
 * />
 * ```
 *
 * @example Custom icon, rich message, and multiple actions
 * ```html
 * <kui-alert appearance="danger" title="Upload failed" (closed)="dismissed.set(true)">
 *   <kui-icon kuiAlertIcon name="cloud-off" />
 *   <p kuiAlertMessage>Check your connection and <a href="/retry">try again</a>.</p>
 *   <div kuiAlertActions>
 *     <button kuiButton shape="ghost" size="xs" (click)="retry()">Retry</button>
 *     <button kuiButton shape="ghost" size="xs" (click)="dismiss()">Dismiss</button>
 *   </div>
 * </kui-alert>
 * ```
 */
@Component({
  selector: 'kui-alert',
  imports: [KuiButtonDirective, KuiIconButtonDirective],
  template: `
    <ng-content select="[kuiAlertIcon]" />
    @if (!hasProjectedIcon() && showIconResolved()) {
      <span class="kui-alert__icon" style="color: var(--kui-alert-icon-color, currentColor)">
        @switch (appearance()) {
          @case ('info') {
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle
                cx="${KUI_INFO_CIRCLE.cx}"
                cy="${KUI_INFO_CIRCLE.cy}"
                r="${KUI_INFO_CIRCLE.r}"
                stroke="currentColor"
                stroke-width="1.5"
              />
              <path
                d="${KUI_INFO_LINE_D}"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              <path
                d="${KUI_INFO_DOT_D}"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          }
          @case ('success') {
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle
                cx="${KUI_CIRCLE_CHECK_CIRCLE.cx}"
                cy="${KUI_CIRCLE_CHECK_CIRCLE.cy}"
                r="${KUI_CIRCLE_CHECK_CIRCLE.r}"
                stroke="currentColor"
                stroke-width="1.5"
              />
              <path
                d="${KUI_CIRCLE_CHECK_D}"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          }
          @case ('warning') {
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="${KUI_TRIANGLE_ALERT_D[0]}"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="${KUI_TRIANGLE_ALERT_D[1]}"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="${KUI_TRIANGLE_ALERT_D[2]}"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          }
          @case ('danger') {
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle
                cx="${KUI_CIRCLE_X_CIRCLE.cx}"
                cy="${KUI_CIRCLE_X_CIRCLE.cy}"
                r="${KUI_CIRCLE_X_CIRCLE.r}"
                stroke="currentColor"
                stroke-width="1.5"
              />
              <path
                d="${KUI_CIRCLE_X_D[0]}"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              <path
                d="${KUI_CIRCLE_X_D[1]}"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          }
        }
      </span>
    }

    <div class="kui-alert__body">
      <ng-content select="[kuiAlertTitle]" />
      @if (!hasProjectedTitle() && title()) {
        <div class="kui-alert__title">{{ title() }}</div>
      }
      <ng-content select="[kuiAlertMessage]" />
      @if (!hasProjectedMessage() && message()) {
        <div class="kui-alert__message">{{ message() }}</div>
      }
      <ng-content select="[kuiAlertActions]" />
      @if (!hasProjectedActions() && actionLabel(); as label) {
        <button
          kuiButton
          shape="ghost"
          size="xs"
          type="button"
          class="kui-alert__action"
          (click)="action.emit()"
        >
          {{ label }}
        </button>
      }
    </div>

    @if (closable()) {
      <button
        kuiIconButton
        shape="ghost"
        size="xs"
        type="button"
        class="kui-alert__close"
        [attr.aria-label]="closeLabel()"
        (click)="closed.emit()"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="${KUI_X_D[0]}" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <path d="${KUI_X_D[1]}" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
    }
  `,
  host: {
    class: 'kui-alert',
    // `title` is also this component's public input name. A static `title="…"` attribute in a
    // template is both bound to that input AND left on the host element as a real DOM attribute,
    // which would trigger a native browser tooltip duplicating the visible title on hover. Force
    // it off so `title` only ever reaches the visible `.kui-alert__title`, the same pattern
    // `PlaygroundPanelComponent` uses for its own `title` input.
    '[attr.title]': 'null',
    '[attr.data-kui-appearance]': 'appearance()',
    '[attr.data-kui-shape]': 'shape()',
    '[attr.data-kui-size]': 'effectiveSize()',
    '[attr.data-kui-banner]': 'banner() ? "" : null',
    '[attr.data-kui-single-line]': 'singleLineBody() ? "" : null',
    '[attr.role]': 'role()',
    '[attr.aria-live]': 'ariaLive()',
    'aria-atomic': 'true',
  },
  encapsulation: ViewEncapsulation.None,
})
/** Inline notification embedded in the page content flow. See the class-level example above. */
export class KuiAlertComponent {
  /** Semantic type of the message. `neutral` never shows the built-in icon. Defaults to `'neutral'`. */
  readonly appearance = input<KuiAlertAppearance>('neutral');

  /** Visual weight. Uses the `KuiButtonShape` vocabulary. Defaults to `'soft'`. */
  readonly shape = input<KuiAlertShape>('soft');

  /** Padding/gap density. Defaults to `'md'`. */
  readonly size = input<KuiAlertSize | undefined>();

  /** Stretches the alert full-width and removes its corner radius. Defaults to `false`. */
  readonly banner = input(false, { transform: booleanAttribute });

  /**
   * Optional single-line heading. At least one of `title`/`message`/`[kuiAlertMessage]` should be
   * set. Ignored when `[kuiAlertTitle]` is projected.
   */
  readonly title = input<string | undefined>();

  /** Optional supporting text below the title. Ignored when `[kuiAlertMessage]` is projected. */
  readonly message = input<string | undefined>();

  /**
   * Shows the built-in appearance icon. `neutral` never shows one regardless of this value.
   * Ignored when `[kuiAlertIcon]` is projected -- a projected icon always renders. Defaults to
   * `true`.
   */
  readonly showIcon = input(true, { transform: booleanAttribute });

  /** Shows the close button and enables the `(closed)` output. Defaults to `true`. */
  readonly closable = input(true, { transform: booleanAttribute });

  /** Accessible label for the close button. Defaults to `'Close notification'`. */
  readonly closeLabel = input('Close notification');

  /** Label for the inline ghost action button. Ignored when `[kuiAlertActions]` is projected. */
  readonly actionLabel = input<string | undefined>();

  /** Emits when the action button is clicked. Not emitted for a projected `[kuiAlertActions]`. */
  readonly action = output<void>();

  /** Emits when the close button is clicked. Does not remove the alert -- the caller does. */
  readonly closed = output<void>();

  private readonly projectedIcon = contentChild(KuiAlertIconDirective);
  private readonly projectedTitle = contentChild(KuiAlertTitleDirective);
  private readonly projectedMessage = contentChild(KuiAlertMessageDirective);
  private readonly projectedActions = contentChild(KuiAlertActionsDirective);

  protected readonly hasProjectedIcon = computed(() => !!this.projectedIcon());
  protected readonly hasProjectedTitle = computed(() => !!this.projectedTitle());
  protected readonly hasProjectedMessage = computed(() => !!this.projectedMessage());
  protected readonly hasProjectedActions = computed(() => !!this.projectedActions());

  private readonly rootDefaultSize = injectKuiRootSizeDefault<KuiAlertSize>(KUI_ALERT_SIZES);

  protected readonly effectiveSize = computed(() => this.size() ?? this.rootDefaultSize ?? 'md');

  protected readonly showIconResolved = computed(
    () => this.showIcon() && this.appearance() !== 'neutral',
  );

  /**
   * True when the body renders exactly one line (only `title`, or only `message`, and no action
   * or projected content). The icon/close row then centers on that single line instead of
   * aligning to the top, which would otherwise leave more empty space below the content than
   * above it -- the close button's own height (taller than one line of text) would set the card's
   * height. Projected message/actions content can be any height, so it always keeps the
   * multi-line top alignment.
   */
  protected readonly singleLineBody = computed(() => {
    if (this.hasProjectedTitle() || this.hasProjectedMessage() || this.hasProjectedActions()) {
      return false;
    }
    const hasTitle = !!this.title();
    const hasMessage = !!this.message();
    return hasTitle !== hasMessage && !this.actionLabel();
  });

  /** Urgent (`danger`) alerts interrupt assistive tech; everything else announces politely. */
  protected readonly role = computed(() => (this.appearance() === 'danger' ? 'alert' : 'status'));

  protected readonly ariaLive = computed(() =>
    this.appearance() === 'danger' ? 'assertive' : 'polite',
  );
}
