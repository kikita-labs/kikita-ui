import { booleanAttribute, Component, computed, inject, input, resource } from '@angular/core';
import type { SafeHtml } from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';

import { KuiGlyph } from './kui-glyph';
import type { KuiIconGlyph } from './kui-icon-glyph.type';
import { KUI_ICONS } from './kui-icon-registry.token';
import type { KuiIconSizePreset } from './kui-icon-size.type';
import type { KuiIconContent, KuiIconName, KuiIconRegistry } from './kui-icon-source.type';

const KUI_ICON_SIZE_PRESETS: Record<KuiIconSizePreset, string> = {
  '2xs': 'var(--kui-icon-size-2xs, 0.75rem)',
  xs: 'var(--kui-icon-size-xs, 0.875rem)',
  sm: 'var(--kui-icon-size-sm, 1rem)',
  md: 'var(--kui-icon-size-md, 1.25rem)',
  lg: 'var(--kui-icon-size-lg, 1.5rem)',
  xl: 'var(--kui-icon-size-xl, 2rem)',
  '2xl': 'var(--kui-icon-size-2xl, 2.5rem)',
};

/**
 * Renders a registered icon, a direct `source`, or an external image URL. An icon is either
 * {@link KuiIconGlyph} data (drawn from an allowlist, safe from any source) or trusted inline SVG
 * markup. When `name`/`source`/`src` are all unset, projects light-DOM children instead (e.g.
 * `<kui-icon kuiFieldAffix><svg>...</svg></kui-icon>`) — a synchronous escape hatch for a raw,
 * one-off SVG that isn't worth registering in a shared icon set via `provideKuiIcons`.
 *
 * Names found in a static registry render on the first pass, without waiting for a promise; names
 * that need an async resolver (the default Lucide set, for example) render when it settles.
 */
@Component({
  selector: 'kui-icon',
  imports: [KuiGlyph],
  templateUrl: './kui-icon.html',
  host: {
    class: 'kui-icon',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
    '[attr.aria-label]': 'label()',
    '[style.--kui-icon-size]': 'iconSize()',
    '[style.--kui-icon-stroke-width]': 'strokeWidth() ?? null',
    '[style.--kui-icon-vector-effect]': 'absoluteStrokeWidth() ? "non-scaling-stroke" : null',
  },
})
export class KuiIcon {
  /** Icon name resolved from registered icon sets. */
  readonly name = input<KuiIconName | undefined>();

  /**
   * Direct icon content. Takes precedence over `name`.
   *
   * Pass {@link KuiIconGlyph} data from any source, or static trusted SVG markup. Do not pass
   * user-generated markup.
   */
  readonly source = input<KuiIconContent | undefined>();

  /** External image URL used when no inline icon source is available. */
  readonly src = input<string | undefined>();

  /** Accessible label. Omit for decorative icons. */
  readonly label = input<string | undefined>();

  /**
   * Icon box size.
   *
   * Named presets map to Kikita icon CSS variables. Numbers are converted to pixels. Other strings
   * are passed through as CSS sizes.
   */
  readonly size = input<KuiIconSizePreset | string | number>('1em');

  /**
   * Stroke width of this icon in glyph-grid units (24 by 24 for Lucide), for stroke-based icons.
   * Sets `--kui-icon-stroke-width` on the host; an unset input keeps the icon's own weight or the
   * token set by an ancestor. Filled shapes and markup with an inline `style="stroke-width: …"` are
   * not affected.
   */
  readonly strokeWidth = input<number | string | undefined>();

  /**
   * Keeps the stroke the same number of pixels at any icon size instead of scaling it with the
   * icon. Sets `--kui-icon-vector-effect: non-scaling-stroke` on the host. Defaults to `false`.
   */
  readonly absoluteStrokeWidth = input(false, { transform: booleanAttribute });

  private readonly iconSets = inject(KUI_ICONS, { optional: true }) ?? [];
  private readonly sanitizer = inject(DomSanitizer);

  /**
   * The icon from the latest static registries, available without a promise. Resolution is
   * latest-first like the async path; a function registry earlier in the chain than a match is
   * asked first, so it hands the lookup to the async path.
   */
  private readonly registered = computed<KuiIconContent | undefined>(() => {
    const name = this.name();

    if (!name) {
      return undefined;
    }

    for (let index = this.iconSets.length - 1; index >= 0; index -= 1) {
      const iconSet = this.iconSets[index];

      if (typeof iconSet === 'function') {
        return undefined;
      }

      if (Object.hasOwn(iconSet, name) && iconSet[name]) {
        return iconSet[name];
      }
    }

    return undefined;
  });

  private readonly resolvedIcon = resource({
    params: () => {
      const name = this.name();

      return name && !this.registered() ? { name, iconSets: this.iconSets } : undefined;
    },
    loader: ({ params }) => this.resolveIcon(params.name, params.iconSets),
  });

  private readonly content = computed(
    () => this.source() ?? this.registered() ?? this.resolvedIcon.value(),
  );

  protected readonly glyph = computed<KuiIconGlyph | undefined>(() => {
    const content = this.content();

    return typeof content === 'object' ? content : undefined;
  });

  protected readonly trustedSvgSource = computed<SafeHtml | undefined>(() => {
    const content = this.content();

    return typeof content === 'string' && content
      ? this.sanitizer.bypassSecurityTrustHtml(content)
      : undefined;
  });

  protected readonly imageSource = computed(() => (this.content() ? undefined : this.src()));

  protected readonly iconSize = computed(() => {
    const size = this.size();

    if (typeof size === 'number') {
      return `${size}px`;
    }

    return isKuiIconSizePreset(size) ? KUI_ICON_SIZE_PRESETS[size] : size;
  });

  private async resolveIcon(
    name: KuiIconName,
    iconSets: readonly KuiIconRegistry[],
  ): Promise<KuiIconContent | undefined> {
    for (let index = iconSets.length - 1; index >= 0; index -= 1) {
      const iconSet = iconSets[index];
      const icon =
        typeof iconSet === 'function'
          ? await iconSet(name)
          : Object.hasOwn(iconSet, name)
            ? iconSet[name]
            : undefined;

      if (icon) {
        return icon;
      }
    }

    return undefined;
  }
}

function isKuiIconSizePreset(size: string): size is KuiIconSizePreset {
  return Object.hasOwn(KUI_ICON_SIZE_PRESETS, size);
}
