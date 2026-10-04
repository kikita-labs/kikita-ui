import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  inject,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';

import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import { KuiDefaults } from '../../providers/kui-defaults';
import { injectKuiRootSizeDefault } from '../../providers/kui-defaults.util';
import { optionalBooleanAttribute } from '../../utils/kui-input-transform.util';
import { KuiButton } from '../button';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import {
  KUI_GLYPH_CIRCLE_CHECK,
  KUI_GLYPH_CIRCLE_X,
  KUI_GLYPH_INFO,
  KUI_GLYPH_TRIANGLE_ALERT,
  KUI_GLYPH_X,
} from '../icon/kui-chrome-glyphs';
import { KuiGlyph } from '../icon/kui-glyph';
import { KuiIconButton } from '../icon-button';
import { KuiAlertActions } from './kui-alert-actions';
import type { KuiAlertAppearance } from './kui-alert-appearance.type';
import { KuiAlertIcon } from './kui-alert-icon';
import { KuiAlertMessage } from './kui-alert-message';
import type { KuiAlertShape } from './kui-alert-shape.type';
import type { KuiAlertSize } from './kui-alert-size.type';
import { KuiAlertTitle } from './kui-alert-title';

const KUI_ALERT_SIZES: readonly KuiAlertSize[] = ['sm', 'md'];

/**
 * Inline controlled notification. The consumer removes it after the closed event;
 * there is no timer or overlay. Projected title, icon, message, and action slots
 * replace their matching shorthand inputs. Supply a title, message, or message slot.
 * Neutral hides the built-in icon, but an explicit icon slot always renders.
 * Essential chrome is drawn from synchronous icon data that `defaults.icons` can replace. See
 * docs/alert.md.
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
  imports: [KuiButton, KuiGlyph, KuiIconButton],
  templateUrl: './kui-alert.html',
  host: {
    class: 'kui-alert',
    // `title` is also this component's public input name. A static `title="…"` attribute in a
    // template is both bound to that input AND left on the host element as a real DOM attribute,
    // which would trigger a native browser tooltip duplicating the visible title on hover. Force
    // it off so `title` only ever reaches the visible `.kui-alert__title`, the same pattern
    // `PlaygroundPanelComponent` uses for its own `title` input.
    '[attr.title]': 'null',
    '[attr.data-kui-appearance]': 'appearance()',
    '[attr.data-kui-shape]': 'effectiveShape()',
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
export class KuiAlert {
  /** Semantic type of the message. `neutral` never shows the built-in icon. Defaults to `'neutral'`. */
  readonly appearance = input<KuiAlertAppearance>('neutral');

  /**
   * Visual weight. Uses the `KuiButtonShape` vocabulary. Defaults to `defaults.alert.shape`, then
   * `'soft'`.
   */
  readonly shape = input<KuiAlertShape | undefined>();

  /** Padding/gap density. Defaults to `defaults.alert.size`, then the root size, then `'md'`. */
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
   * `defaults.alert.showIcon`, then `true`.
   */
  readonly showIcon = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });

  /**
   * Shows the close button and enables the `(closed)` output. Defaults to
   * `defaults.alert.closable`, then `true`.
   */
  readonly closable = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });

  /** Accessible label for the close button. Defaults to the `alert.close` message. */
  readonly closeLabel = input<string | undefined>();

  /** Label for the inline ghost action button. Ignored when `[kuiAlertActions]` is projected. */
  readonly actionLabel = input<string | undefined>();

  /** Emits when the action button is clicked. Not emitted for a projected `[kuiAlertActions]`. */
  readonly action = output<void>();

  /** Emits when the close button is clicked. Does not remove the alert -- the caller does. */
  readonly closed = output<void>();

  private readonly projectedIcon = contentChild(KuiAlertIcon);
  private readonly projectedTitle = contentChild(KuiAlertTitle);
  private readonly projectedMessage = contentChild(KuiAlertMessage);
  private readonly projectedActions = contentChild(KuiAlertActions);

  protected readonly hasProjectedIcon = computed(() => !!this.projectedIcon());
  protected readonly hasProjectedTitle = computed(() => !!this.projectedTitle());
  protected readonly hasProjectedMessage = computed(() => !!this.projectedMessage());
  protected readonly hasProjectedActions = computed(() => !!this.projectedActions());

  private readonly rootDefaultSize = injectKuiRootSizeDefault<KuiAlertSize>(KUI_ALERT_SIZES);

  private readonly alertDefaults = inject(KuiDefaults).get('alert');
  protected readonly messages = injectKuiMessages('alert');

  protected readonly effectiveSize = computed(
    () => this.size() ?? this.alertDefaults()?.size ?? this.rootDefaultSize() ?? 'md',
  );
  protected readonly effectiveShape = computed(
    () => this.shape() ?? this.alertDefaults()?.shape ?? 'soft',
  );
  protected readonly effectiveShowIcon = computed(
    () => this.showIcon() ?? this.alertDefaults()?.showIcon ?? true,
  );
  protected readonly effectiveClosable = computed(
    () => this.closable() ?? this.alertDefaults()?.closable ?? true,
  );

  private readonly infoGlyph = injectKuiGlyph({ role: 'statusInfo', fallback: KUI_GLYPH_INFO });
  private readonly successGlyph = injectKuiGlyph({
    role: 'statusSuccess',
    fallback: KUI_GLYPH_CIRCLE_CHECK,
  });
  private readonly warningGlyph = injectKuiGlyph({
    role: 'statusWarning',
    fallback: KUI_GLYPH_TRIANGLE_ALERT,
  });
  private readonly dangerGlyph = injectKuiGlyph({
    role: 'statusDanger',
    fallback: KUI_GLYPH_CIRCLE_X,
  });

  protected readonly statusGlyph = computed(() => {
    switch (this.appearance()) {
      case 'success':
        return this.successGlyph();
      case 'warning':
        return this.warningGlyph();
      case 'danger':
        return this.dangerGlyph();
      default:
        return this.infoGlyph();
    }
  });

  protected readonly closeGlyph = injectKuiGlyph({
    role: 'close',
    slot: () => this.alertDefaults()?.closeIcon,
    fallback: KUI_GLYPH_X,
  });

  protected readonly showIconResolved = computed(
    () => this.effectiveShowIcon() && this.appearance() !== 'neutral',
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
