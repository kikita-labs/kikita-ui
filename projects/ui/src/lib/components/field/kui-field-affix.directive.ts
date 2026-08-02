import { Directive, input } from '@angular/core';

/** Visual emphasis for `[kuiFieldAffix]`. `strong` uses full text color instead of muted. */
export type KuiFieldAffixEmphasis = 'default' | 'strong';

/**
 * Applies Kikita UI field-affix text styling to a prefix/suffix element placed beside a control
 * inside `kui-field` (e.g. `https://` / `.dev` around a domain input). `kui-field` detects this
 * directive and switches its control slot to shared `.kui-input-group` chrome automatically — no
 * wrapper markup needed.
 *
 * @example
 * ```html
 * <kui-field label="Project URL">
 *   <span kuiFieldAffix>https://</span>
 *   <input kuiInput value="kikita" />
 *   <span kuiFieldAffix>.dev</span>
 * </kui-field>
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
 * Applies Kikita UI field-affix styling to a decorative prefix/suffix icon inside `kui-field`
 * (e.g. a search icon before the input). `kui-field` detects this directive and switches its
 * control slot to shared `.kui-input-group` chrome automatically — no wrapper markup needed.
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
 * Applies Kikita UI field-action button styling to a custom prefix/suffix action inside
 * `kui-field` (e.g. a clear button). `kui-field` detects this directive and switches its control
 * slot to shared `.kui-input-group` chrome automatically — no wrapper markup needed.
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
