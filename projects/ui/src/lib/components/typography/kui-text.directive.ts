import { Directive, input } from '@angular/core';

import { KuiTextTone } from './kui-text-tone.type';
import { KuiTextVariant } from './kui-text-variant.type';

/** Applies Kikita UI semantic typography role and tone classes to native text elements. */
@Directive({
  selector: '[kuiText]',
  host: {
    '[class.kui-display]': "variant() === 'display'",
    '[class.kui-heading-lg]': "variant() === 'heading-lg'",
    '[class.kui-heading-md]': "variant() === 'heading-md'",
    '[class.kui-heading-sm]': "variant() === 'heading-sm'",
    '[class.kui-title]': "variant() === 'title'",
    '[class.kui-body-lg]': "variant() === 'body-lg'",
    '[class.kui-body]': "variant() === 'body'",
    '[class.kui-body-sm]': "variant() === 'body-sm'",
    '[class.kui-caption]': "variant() === 'caption'",
    '[class.kui-overline]': "variant() === 'overline'",
    '[class.kui-code]': "variant() === 'code'",
    '[class.kui-text-default]': "tone() === 'default'",
    '[class.kui-text-muted]': "tone() === 'muted'",
    '[class.kui-text-disabled]': "tone() === 'disabled'",
    '[class.kui-text-primary]': "tone() === 'primary'",
    '[class.kui-text-success]': "tone() === 'success'",
    '[class.kui-text-warning]': "tone() === 'warning'",
    '[class.kui-text-danger]': "tone() === 'danger'",
    '[attr.data-kui-text-variant]': 'variant()',
    '[attr.data-kui-text-tone]': 'tone()',
  },
})
export class KuiTextDirective {
  /** Semantic typography role mapped to `.kui-*` role classes. */
  readonly variant = input<KuiTextVariant>('body');

  /** Semantic text color tone mapped to `.kui-text-*` tone classes. */
  readonly tone = input<KuiTextTone>('default');
}
