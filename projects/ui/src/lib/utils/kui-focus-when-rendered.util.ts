import type { Injector } from '@angular/core';
import { afterNextRender } from '@angular/core';

/** Elements that can take focus on their own, before `disabled`, `inert` and visibility checks. */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'summary',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

/** Surfaces that run their own enter animation and focus handling. */
const FOCUS_SCOPE_SELECTOR = 'dialog, [role="dialog"], [role="alertdialog"], [popover]';

/** Longest time to wait for a scope's enter animation before focusing anyway, in milliseconds. */
const ANIMATION_WAIT_LIMIT = 1000;

/** Options for {@link focusWhenRendered}. */
export interface KuiFocusWhenRenderedOptions {
  /** Injector of the calling directive or component; supplies the render hook. */
  readonly injector: Injector;

  /** Resolves the element to focus. Called again right before focusing, so it can follow the DOM. */
  readonly target: () => HTMLElement | null;

  /** Passed to `focus({ preventScroll })`. Defaults to `false`, the native behavior. */
  readonly preventScroll?: boolean;

  /**
   * Skips the focus when the user already focused something else outside the target's dialog or
   * popover. Use it for focus on first render; leave it off when the application asks for focus.
   */
  readonly yieldToFocused?: boolean;
}

/**
 * Resolves the element a focus request should land on.
 *
 * The host itself when it can take focus; otherwise its first focusable, tabbable descendant that is
 * not disabled and not inside an `inert` subtree. No `tabindex` is ever added to force focus.
 */
export function resolveKuiFocusTarget(host: HTMLElement): HTMLElement | null {
  if (isFocusCandidate(host, true)) return host;

  for (const element of host.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) {
    if (element.getAttribute('tabindex') !== '-1' && isFocusCandidate(element, false)) {
      return element;
    }
  }

  return null;
}

/**
 * Focuses an element after the browser has rendered, once, and returns a function that cancels a
 * pending request.
 *
 * Server rendering never focuses: the render hook does not run there. When the target sits inside a
 * dialog or popover that is still animating in, the focus waits for that animation (bounded) so the
 * page does not scroll or jump mid-animation.
 *
 * @returns A function that cancels the request if it has not run yet.
 */
export function focusWhenRendered(options: KuiFocusWhenRenderedOptions): () => void {
  let cancelled = false;

  const ref = afterNextRender(
    () => {
      void run(options, () => cancelled);
    },
    { injector: options.injector },
  );

  return () => {
    cancelled = true;
    ref.destroy();
  };
}

async function run(options: KuiFocusWhenRenderedOptions, isCancelled: () => boolean) {
  const first = options.target();
  if (!first) return;

  await waitForScopeAnimations(first.closest(FOCUS_SCOPE_SELECTOR));
  if (isCancelled()) return;

  const target = options.target();
  if (!target?.isConnected) return;

  if (options.yieldToFocused && isFocusTaken(target)) return;

  target.focus({ preventScroll: options.preventScroll ?? false });
}

function isFocusCandidate(element: HTMLElement, allowTabindexMinusOne: boolean): boolean {
  if (!element.matches(FOCUSABLE_SELECTOR)) return false;
  if (!allowTabindexMinusOne && element.getAttribute('tabindex') === '-1') return false;
  if ((element as HTMLInputElement).disabled) return false;
  if (element.closest('[inert]')) return false;

  // `checkVisibility` is missing in some engines; those fall back to "visible".
  return element.checkVisibility?.({ visibilityProperty: true }) ?? true;
}

/** True when the user is already working somewhere that is not the target or its dialog. */
function isFocusTaken(target: HTMLElement): boolean {
  const active = target.ownerDocument.activeElement;
  if (!active || active === target || active === target.ownerDocument.body) return false;

  const scope = target.closest(FOCUS_SCOPE_SELECTOR);

  return !scope?.contains(active);
}

function waitForScopeAnimations(scope: Element | null): Promise<void> {
  if (!scope || typeof scope.getAnimations !== 'function') return Promise.resolve();

  // An animation that never ends (a spinner) must not hold focus back.
  const finite = scope
    .getAnimations({ subtree: true })
    .filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity);
  if (finite.length === 0) return Promise.resolve();

  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ANIMATION_WAIT_LIMIT);
    void Promise.allSettled(finite.map((animation) => animation.finished)).then(() => {
      clearTimeout(timer);
      resolve();
    });
  });
}
