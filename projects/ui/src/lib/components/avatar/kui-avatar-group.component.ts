import { Component, computed, inject, input } from '@angular/core';

import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import { KuiDefaults } from '../../providers/kui-defaults.service';
import { injectKuiRootSizeDefault } from '../../utils/kui-defaults.util';
import { optionalPositiveIntegerAttribute } from '../../utils/kui-input-transform.util';
import { KuiAvatarComponent } from './kui-avatar.component';
import type { KuiAvatarItem } from './kui-avatar-item.interface';
import type { KuiAvatarShape } from './kui-avatar-shape.type';
import type { KuiAvatarSize } from './kui-avatar-size.type';

/** Renders an overlapping avatar stack with an overflow avatar when items exceed the limit. */
@Component({
  selector: 'kui-avatar-group',
  imports: [KuiAvatarComponent],
  templateUrl: './kui-avatar-group.component.html',
  host: {
    class: 'kui-avatar-group',
    '[attr.data-kui-size]': 'effectiveSize()',
    '[attr.data-kui-shape]': 'effectiveShape()',
    '[attr.role]': '"group"',
    '[attr.aria-label]': 'effectiveLabel()',
    '[attr.title]': 'null',
  },
})
export class KuiAvatarGroupComponent {
  /** Avatar items rendered by the group. */
  readonly avatars = input<readonly KuiAvatarItem[]>([]);

  /**
   * Maximum visible avatars before rendering an overflow counter. Defaults to
   * `defaults.avatarGroup.max`, then `4`. Invalid or less-than-one values resolve to `1`.
   */
  readonly max = input<number | undefined, unknown>(undefined, {
    transform: optionalPositiveIntegerAttribute,
  });

  /**
   * Size applied to every avatar in the group. Defaults to `defaults.avatarGroup.size`, then the
   * root size default, then `md`.
   */
  readonly size = input<KuiAvatarSize | undefined>();

  /** Shape applied to every avatar in the group. Defaults to `defaults.avatarGroup.shape`, then `circle`. */
  readonly shape = input<KuiAvatarShape | undefined>();

  /** Accessible group label. Defaults to the `avatarGroup.label` message. */
  readonly label = input<string | undefined>();

  private readonly avatarGroupDefaults = inject(KuiDefaults).get('avatarGroup');
  private readonly messages = injectKuiMessages('avatarGroup');

  protected readonly effectiveLabel = computed(() => this.label() ?? this.messages().label);
  private readonly rootDefaultSize = injectKuiRootSizeDefault<KuiAvatarSize>();

  protected readonly effectiveSize = computed(
    () => this.size() ?? this.avatarGroupDefaults()?.size ?? this.rootDefaultSize() ?? 'md',
  );

  protected readonly effectiveShape = computed<KuiAvatarShape>(
    () => this.shape() ?? this.avatarGroupDefaults()?.shape ?? 'circle',
  );

  protected readonly effectiveMax = computed(
    () => this.max() ?? this.avatarGroupDefaults()?.max ?? 4,
  );

  protected readonly visibleAvatars = computed(() => {
    const max = Math.max(1, Math.floor(this.effectiveMax()));

    return this.avatars().slice(0, max);
  });

  protected readonly overflowCount = computed(() =>
    Math.max(0, this.avatars().length - this.visibleAvatars().length),
  );

  protected readonly overflowLabel = computed(() =>
    this.messages().overflow({ count: this.overflowCount() }),
  );
}
