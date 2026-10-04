import { computed, Directive, inject, input } from '@angular/core';

import { KuiDefaults } from '../../providers/kui-defaults.service';
import { KUI_TEXT_IGNORES_DEFAULTS } from './kui-text-defaults-opt-out.token';
import type { KuiTextTone } from './kui-text-tone.type';
import type { KuiTextVariant } from './kui-text-variant.type';

/** Applies Kikita UI semantic typography role and tone classes to native text elements. */
@Directive({
  selector: '[kuiText]',
  host: {
    '[class.kui-display]': "effectiveVariant() === 'display'",
    '[class.kui-heading-lg]': "effectiveVariant() === 'heading-lg'",
    '[class.kui-heading-md]': "effectiveVariant() === 'heading-md'",
    '[class.kui-heading-sm]': "effectiveVariant() === 'heading-sm'",
    '[class.kui-title]': "effectiveVariant() === 'title'",
    '[class.kui-body-lg]': "effectiveVariant() === 'body-lg'",
    '[class.kui-body]': "effectiveVariant() === 'body'",
    '[class.kui-body-sm]': "effectiveVariant() === 'body-sm'",
    '[class.kui-caption]': "effectiveVariant() === 'caption'",
    '[class.kui-overline]': "effectiveVariant() === 'overline'",
    '[class.kui-code]': "effectiveVariant() === 'code'",
    '[class.kui-text-default]': "effectiveTone() === 'default'",
    '[class.kui-text-muted]': "effectiveTone() === 'muted'",
    '[class.kui-text-disabled]': "effectiveTone() === 'disabled'",
    '[class.kui-text-primary]': "effectiveTone() === 'primary'",
    '[class.kui-text-success]': "effectiveTone() === 'success'",
    '[class.kui-text-warning]': "effectiveTone() === 'warning'",
    '[class.kui-text-danger]': "effectiveTone() === 'danger'",
    '[attr.data-kui-text-variant]': 'effectiveVariant()',
    '[attr.data-kui-text-tone]': 'effectiveTone()',
  },
})
export class KuiText {
  /** Semantic typography role mapped to `.kui-*` role classes. Defaults to `defaults.typography.variant`, then `body`. */
  readonly variant = input<KuiTextVariant | undefined>();

  /** Semantic text color tone mapped to `.kui-text-*` tone classes. Defaults to `defaults.typography.tone`, then `default`. */
  readonly tone = input<KuiTextTone | undefined>();

  private readonly typographyDefaults = inject(KuiDefaults).get('typography');
  private readonly ignoresDefaults = inject(KUI_TEXT_IGNORES_DEFAULTS, {
    optional: true,
    self: true,
  });

  private readonly configured = computed(() =>
    this.ignoresDefaults ? undefined : this.typographyDefaults(),
  );

  protected readonly effectiveVariant = computed(
    () => this.variant() ?? this.configured()?.variant ?? 'body',
  );
  protected readonly effectiveTone = computed(
    () => this.tone() ?? this.configured()?.tone ?? 'default',
  );
}
