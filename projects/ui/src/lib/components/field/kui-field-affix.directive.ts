import { Directive, input } from '@angular/core';

/** Visual emphasis for `[kuiFieldAffix]`. `strong` uses full text color instead of muted. */
export type KuiFieldAffixEmphasis = 'default' | 'strong';

/**
 * Applies Kikita UI field-affix text styling to a prefix/suffix element placed beside a
 * control inside `.kui-input-group` (e.g. `https://` / `.dev` around a domain input).
 *
 * @example
 * ```html
 * <div class="kui-input-group">
 *   <span kuiFieldAffix>https://</span>
 *   <input kuiInput value="kikita" />
 *   <span kuiFieldAffix>.dev</span>
 * </div>
 * ```
 */
@Directive({
  selector: '[kuiFieldAffix]',
  host: {
    class: 'kui-field-affix',
    '[attr.data-kui-emphasis]': 'emphasis()',
  },
})
export class KuiFieldAffixDirective {
  /** Visual emphasis. Defaults to muted text; `strong` uses the full text color. */
  readonly emphasis = input<KuiFieldAffixEmphasis>('default');
}

/**
 * Applies Kikita UI field-affix styling to a decorative prefix/suffix icon inside
 * `.kui-input-group` (e.g. a search icon before the input).
 *
 * @example
 * ```html
 * <div class="kui-input-group">
 *   <span kuiFieldAffixIcon><svg>...</svg></span>
 *   <input kuiInput placeholder="Search" />
 * </div>
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
 * Applies Kikita UI field-action button styling to a custom prefix/suffix action inside
 * `.kui-input-group` (e.g. a clear button).
 *
 * @example
 * ```html
 * <div class="kui-input-group">
 *   <input kuiInput [(value)]="query" />
 *   <button kuiFieldAction type="button" aria-label="Clear"><svg>...</svg></button>
 * </div>
 * ```
 */
@Directive({
  selector: 'button[kuiFieldAction]',
  host: {
    class: 'kui-field-action',
  },
})
export class KuiFieldActionDirective {}
