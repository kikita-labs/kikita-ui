import { Component } from '@angular/core';

import { KuiBadgeDirective, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the documented Badge appearances, sizes, and semantic host elements. */
@Component({
  selector: 'app-badge',
  imports: [KuiBadgeDirective, KuiTextDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
})
export class Badge {
  protected readonly appearances = [
    { value: 'neutral', label: 'badge.appearances.neutral', group: 'badge.accessibility.neutral' },
    { value: 'primary', label: 'badge.appearances.primary', group: 'badge.accessibility.primary' },
    { value: 'success', label: 'badge.appearances.success', group: 'badge.accessibility.success' },
    { value: 'warning', label: 'badge.appearances.warning', group: 'badge.accessibility.warning' },
    { value: 'danger', label: 'badge.appearances.danger', group: 'badge.accessibility.danger' },
    { value: 'info', label: 'badge.appearances.info', group: 'badge.accessibility.info' },
  ] as const;

  protected readonly sizes = [
    { value: 'xs', label: 'badge.sizes.extraSmall' },
    { value: 'sm', label: 'badge.sizes.small' },
    { value: 'md', label: 'badge.sizes.medium' },
    { value: 'lg', label: 'badge.sizes.large' },
  ] as const;
}
