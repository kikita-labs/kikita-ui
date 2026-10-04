import {
  booleanAttribute,
  Component,
  computed,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';

import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import { KuiDefaults } from '../../providers/kui-defaults.service';
import { injectKuiRootSizeDefault } from '../../providers/kui-defaults.util';
import type { KuiSkeletonShape } from '../skeleton';
import { KuiSkeleton } from '../skeleton';
import type { KuiAvatarShape } from './kui-avatar-shape.type';
import type { KuiAvatarSize } from './kui-avatar-size.type';
import type { KuiAvatarStatus } from './kui-avatar-status.type';

function numberOrUndefinedAttribute(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;

  const parsed = numberAttribute(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Renders an accessible user or entity avatar with image, initials, or icon fallback. */
@Component({
  selector: 'kui-avatar',
  imports: [KuiSkeleton],
  templateUrl: './kui-avatar.component.html',
  host: {
    class: 'kui-avatar',
    '[attr.data-kui-size]': 'effectiveSize()',
    '[attr.data-kui-shape]': 'effectiveShape()',
    '[attr.data-kui-status]': 'status()',
    '[attr.data-kui-palette]': 'paletteSlot()',
    '[attr.data-kui-loading]': 'loading() ? "" : null',
    '[attr.role]': 'hostRole()',
    '[attr.aria-label]': 'hostLabel()',
    '[attr.title]': 'null',
  },
})
export class KuiAvatar {
  /** Optional image URL. Falls back to initials or icon when loading fails. */
  readonly src = input<string | undefined>();

  /** Human-readable name used for initials, palette hashing, and accessibility. */
  readonly name = input<string | undefined>();

  /** Explicit initials override. Keep this to one or two visible characters. */
  readonly initials = input<string | undefined>();

  /** Optional image alt override. Defaults to `name`. */
  readonly alt = input<string | undefined>();

  /** Avatar size. Defaults to `defaults.avatar.size`, then the root size default, then `md`. */
  readonly size = input<KuiAvatarSize | undefined>();

  /** Avatar shape. Defaults to `defaults.avatar.shape`, then `circle`. */
  readonly shape = input<KuiAvatarShape | undefined>();

  /** Optional presence status. */
  readonly status = input<KuiAvatarStatus | undefined>();

  /** Optional palette slot from 1 to 7. Defaults to a stable hash of the name. */
  readonly paletteIndex = input<number | undefined, unknown>(undefined, {
    transform: numberOrUndefinedAttribute,
  });

  /** Shows the skeleton/shimmer loading state and hides avatar content. */
  readonly loading = input(false, { transform: booleanAttribute });

  private readonly avatarDefaults = inject(KuiDefaults).get('avatar');
  private readonly messages = injectKuiMessages('avatar');
  private readonly rootDefaultSize = injectKuiRootSizeDefault<KuiAvatarSize>();
  private readonly failedImageSrc = signal<string | undefined>(undefined);

  protected readonly effectiveSize = computed(
    () => this.size() ?? this.avatarDefaults()?.size ?? this.rootDefaultSize() ?? 'md',
  );

  protected readonly effectiveShape = computed<KuiAvatarShape>(
    () => this.shape() ?? this.avatarDefaults()?.shape ?? 'circle',
  );

  protected readonly imageSrc = computed(() => {
    const src = this.src();

    return src && this.failedImageSrc() !== src && !this.loading() ? src : undefined;
  });

  protected readonly displayInitials = computed(() => this.resolveInitials());

  protected readonly accessibleLabel = computed(() => {
    const messages = this.messages();
    const base = this.alt() ?? this.name() ?? this.displayInitials() ?? messages.fallback;
    const status = this.status();
    if (!status) return base;

    const words: Record<KuiAvatarStatus, string> = {
      online: messages.statusOnline,
      away: messages.statusAway,
      busy: messages.statusBusy,
      offline: messages.statusOffline,
    };

    return messages.withStatus({ label: base, status: words[status] });
  });

  protected readonly imageAlt = computed(() => this.accessibleLabel());

  protected readonly hostRole = computed(() => (this.imageSrc() || this.loading() ? null : 'img'));

  protected readonly hostLabel = computed(() =>
    this.imageSrc() || this.loading() ? null : this.accessibleLabel(),
  );

  protected readonly paletteSlot = computed(() => {
    if (this.imageSrc() || this.loading()) {
      return null;
    }

    const explicit = this.paletteIndex();
    const slot =
      explicit === undefined
        ? stablePaletteSlot(this.name() ?? this.displayInitials() ?? 'avatar')
        : clampPaletteSlot(explicit);

    return String(slot);
  });

  protected readonly skeletonShape = computed<KuiSkeletonShape>(() =>
    this.effectiveShape() === 'circle' ? 'circle' : 'square',
  );

  protected onImageError(): void {
    this.failedImageSrc.set(this.src());
  }

  private resolveInitials(): string | undefined {
    const explicit = normalizeInitials(this.initials());

    if (explicit) {
      return explicit;
    }

    const name = this.name()?.trim();

    if (!name) {
      return undefined;
    }

    const parts = name.split(/\s+/).filter(Boolean);

    if (parts.length === 1) {
      return normalizeInitials(parts[0]);
    }

    return normalizeInitials(`${Array.from(parts[0])[0] ?? ''}${Array.from(parts[1])[0] ?? ''}`);
  }
}

function normalizeInitials(value: string | undefined): string | undefined {
  const normalized = Array.from(value?.trim() ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return normalized || undefined;
}

function stablePaletteSlot(value: string): number {
  let hash = 0;

  for (const char of value) {
    hash = (hash * 31 + char.codePointAt(0)!) % 997;
  }

  return (hash % 7) + 1;
}

function clampPaletteSlot(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(7, Math.max(1, Math.round(value)));
}
