import { computed, Directive, effect, ElementRef, inject, input, Renderer2 } from '@angular/core';

import { KuiIconComponent } from '../icon/kui-icon.component';
import { KuiLoaderDirective } from '../loader/kui-loader.directive';

/** Visual emphasis for `[kuiFieldAffix]` text. `strong` uses full text color instead of muted. */
export type KuiFieldAffixEmphasis = 'default' | 'strong';

type KuiFieldAffixKind = 'action' | 'icon' | 'text';

/**
 * Applies Kikita UI field-affix styling to a prefix/suffix element placed beside a control inside
 * `kui-field` (e.g. `https://` / `.dev` around a domain input, a search icon, or a clear button).
 * `kui-field` detects this directive and switches its control slot to shared `.kui-input-group`
 * chrome automatically — no wrapper markup needed. See `docs/field.md` for full examples.
 *
 * One directive, three looks, auto-detected from the host element:
 * - `<button kuiFieldAffix>` (any `<button>`) -> action styling -- do not also add
 *   `kuiButton`/`kuiIconButton`, their own chrome would fight this compact affix chrome.
 * - `<kui-icon kuiFieldAffix>` or `<span kuiLoader kuiFieldAffix>` -> icon styling (fixed square
 *   slot); `aria-hidden`/`role`/`aria-live` stay owned by that host, not forced by this directive.
 * - anything else -> muted text styling (`emphasis` input for full-color text).
 */
@Directive({
  selector: '[kuiFieldAffix]',
  host: {
    '[class.kui-field-affix]': "kind() === 'text'",
    '[class.kui-field-affix-icon]': "kind() === 'icon'",
    '[class.kui-field-action]': "kind() === 'action'",
    '[attr.data-kui-emphasis]': "kind() === 'text' ? emphasis() : null",
  },
})
export class KuiFieldAffixDirective {
  /** Visual emphasis for text affixes. Defaults to muted text; `strong` uses full text color. */
  readonly emphasis = input<KuiFieldAffixEmphasis>('default');

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  protected readonly iconHost = inject(KuiIconComponent, { optional: true, self: true });
  private readonly loaderHost = inject(KuiLoaderDirective, { optional: true, self: true });

  /** @internal Detected look, exposed for `kui-field`'s input-group chrome detection. */
  readonly kind = computed<KuiFieldAffixKind>(() => {
    if (this.host.nativeElement.tagName === 'BUTTON') return 'action';
    if (this.iconHost || this.loaderHost) return 'icon';
    return 'text';
  });

  constructor() {
    // A `kui-icon` host already owns its own `aria-hidden` (delegating to its `label` input), and
    // a `kuiLoader` host owns its own `role="status"`/`aria-live`/`aria-label` -- a declarative
    // host binding here would race with either for write order on the same attribute, and forcing
    // `aria-hidden` on a loader would silence the very announcement it exists to make. Only force
    // it imperatively, once, for a decorative icon that is neither (a raw `<svg>` with no aria
    // handling of its own).
    effect(() => {
      if (this.kind() === 'icon' && !this.iconHost && !this.loaderHost) {
        this.renderer.setAttribute(this.host.nativeElement, 'aria-hidden', 'true');
      }
    });
  }
}

/**
 * Icon-look override for a prefix/suffix element `kuiFieldAffix` can't auto-detect on its own --
 * a raw `<svg>` used as a decorative icon without going through `kui-icon`.
 *
 * @deprecated Wrap the same `<svg>` in `<kui-icon kuiFieldAffix>` instead (`kui-icon` now
 * supports projected content when `name`/`source`/`src` are unset, rendered synchronously, no
 * `provideKuiIcons` registration needed) -- `kuiFieldAffix` then auto-detects the icon look and
 * delegates `aria-hidden` to `kui-icon` itself. Kept for markup written before that existed;
 * planned for removal in the next major version.
 *
 * @example
 * ```html
 * <kui-field label="Search">
 *   <span kuiFieldAffixIcon><svg>...</svg></span>
 *   <input kuiInput placeholder="Search" />
 * </kui-field>
 * ```
 */
@Directive({
  selector: '[kuiFieldAffixIcon]',
  host: {
    class: 'kui-field-affix-icon',
    'aria-hidden': 'true',
  },
})
export class KuiFieldAffixIconDirective {}

/**
 * Field-action button styling for a prefix/suffix `<button>`.
 *
 * @deprecated Use `kuiFieldAffix` directly on the `<button>` instead -- it auto-detects any
 * `<button>` host and applies this same action styling, no separate directive needed. Kept for
 * markup written before that auto-detection existed; planned for removal in the next major
 * version.
 *
 * @example
 * ```html
 * <kui-field>
 *   <input kuiInput [(value)]="query" />
 *   <button kuiFieldAction type="button" aria-label="Clear"><svg>...</svg></button>
 * </kui-field>
 * ```
 */
@Directive({
  selector: 'button[kuiFieldAction]',
  host: {
    class: 'kui-field-action',
  },
})
export class KuiFieldActionDirective {}
