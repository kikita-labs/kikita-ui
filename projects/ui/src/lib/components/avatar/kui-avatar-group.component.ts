import { Component, computed, input } from '@angular/core';

import { injectKuiRootSizeDefault } from '../../utils/kui-defaults.util';
import { KuiAvatarItem } from './kui-avatar-item.interface';
import { KuiAvatarShape } from './kui-avatar-shape.type';
import { KuiAvatarSize } from './kui-avatar-size.type';
import { KuiAvatarComponent } from './kui-avatar.component';

/** Renders an overlapping avatar stack with an overflow avatar when items exceed the limit. */
@Component({
  selector: 'kui-avatar-group',
  imports: [KuiAvatarComponent],
  templateUrl: './kui-avatar-group.component.html',
  host: {
    class: 'kui-avatar-group',
    '[attr.data-kui-size]': 'effectiveSize()',
    '[attr.data-kui-shape]': 'shape()',
    '[attr.role]': '"group"',
    '[attr.aria-label]': 'label()',
    '[attr.title]': 'null',
  },
})
export class KuiAvatarGroupComponent {
  /** Avatar items rendered by the group. */
  readonly avatars = input<readonly KuiAvatarItem[]>([]);

  /** Maximum visible avatars before rendering an overflow counter. */
  readonly max = input(4);

  /** Size applied to every avatar in the group. */
  readonly size = input<KuiAvatarSize | undefined>();

  /** Shape applied to every avatar in the group. */
  readonly shape = input<KuiAvatarShape>('circle');

  /** Accessible group label. */
  readonly label = input('Avatar group');

  private readonly rootDefaultSize = injectKuiRootSizeDefault<KuiAvatarSize>();

  protected readonly effectiveSize = computed(() => this.size() ?? this.rootDefaultSize ?? 'md');

  protected readonly visibleAvatars = computed(() => {
    const max = Math.max(1, Math.floor(this.max()));

    return this.avatars().slice(0, max);
  });

  protected readonly overflowCount = computed(() =>
    Math.max(0, this.avatars().length - this.visibleAvatars().length),
  );

  protected readonly overflowLabel = computed(() => `${this.overflowCount()} more`);
}
