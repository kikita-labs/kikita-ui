import {
  booleanAttribute,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  untracked,
} from '@angular/core';

import { focusWhenRendered, resolveKuiFocusTarget } from '../../utils/kui-focus-when-rendered.util';

/**
 * Moves focus to the host element, or to its first focusable descendant, after the browser has
 * rendered.
 *
 * Focus moves once on first render and again every time the value changes from `false` to `true`.
 * It never runs on the server and never adds a `tabindex`. A disabled, hidden or `inert` target
 * receives no focus. On first render the request yields when the user has already focused something
 * outside the target's dialog or popover; a later `false` to `true` change is an explicit request and
 * always focuses. Inside a dialog or popover that is still animating in, focus waits for the
 * animation. The host also gets `cdkFocusInitial` while enabled, so a Kikita UI dialog or drawer
 * focus trap lands on the same element.
 *
 * Automatic focus can disorient screen-reader users and open the on-screen keyboard on touch
 * devices; use it where the next step is obvious, such as the first field of a dialog.
 *
 * @example
 * ```html
 * <input kuiInput kuiAutoFocus />
 * <input kuiInput [kuiAutoFocus]="editing()" />
 * ```
 */
@Directive({
  selector: '[kuiAutoFocus]',
  host: {
    '[attr.cdkFocusInitial]': 'kuiAutoFocus() ? "" : null',
  },
})
export class KuiAutoFocusDirective {
  /**
   * Enables focus. The attribute without a value counts as `true`. Changing it from `false` to
   * `true` focuses again. Defaults to `false`.
   */
  readonly kuiAutoFocus = input(false, { transform: booleanAttribute });

  /** Focuses without scrolling the element into view. Defaults to `false`, the native behavior. */
  readonly kuiAutoFocusPreventScroll = input(false, { transform: booleanAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);

  private cancelPending: (() => void) | null = null;

  constructor() {
    let wasEnabled = false;
    let firstRun = true;

    effect(() => {
      const enabled = this.kuiAutoFocus();

      untracked(() => {
        if (enabled && !wasEnabled) {
          this.cancelPending?.();
          this.cancelPending = focusWhenRendered({
            injector: this.injector,
            target: () => resolveKuiFocusTarget(this.host),
            preventScroll: this.kuiAutoFocusPreventScroll(),
            yieldToFocused: firstRun,
          });
        } else if (!enabled) {
          this.cancelPending?.();
          this.cancelPending = null;
        }

        wasEnabled = enabled;
        firstRun = false;
      });
    });

    inject(DestroyRef).onDestroy(() => this.cancelPending?.());
  }
}
