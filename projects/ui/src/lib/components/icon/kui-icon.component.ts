import { Component, computed, inject, input, resource } from '@angular/core';
import type { SafeHtml } from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';

import { KUI_ICONS } from './kui-icon-registry.token';
import type { KuiIconSizePreset } from './kui-icon-size.type';
import type { KuiIconName, KuiIconRegistry, KuiIconSource } from './kui-icon-source.type';

const KUI_ICON_SIZE_PRESETS: Record<KuiIconSizePreset, string> = {
  '2xs': 'var(--kui-icon-size-2xs, 0.75rem)',
  xs: 'var(--kui-icon-size-xs, 0.875rem)',
  sm: 'var(--kui-icon-size-sm, 1rem)',
  md: 'var(--kui-icon-size-md, 1.25rem)',
  lg: 'var(--kui-icon-size-lg, 1.5rem)',
  xl: 'var(--kui-icon-size-xl, 2rem)',
  '2xl': 'var(--kui-icon-size-2xl, 2.5rem)',
};

/** Renders a registered inline SVG icon, direct inline SVG source, or external image URL. */
@Component({
  selector: 'kui-icon',
  templateUrl: './kui-icon.component.html',
  styleUrl: './kui-icon.component.css',
  host: {
    class: 'kui-icon',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
    '[attr.aria-label]': 'label()',
    '[style.--kui-icon-size]': 'iconSize()',
  },
})
export class KuiIconComponent {
  /** Icon name resolved from registered icon sets. */
  readonly name = input<KuiIconName | undefined>();

  /**
   * Direct inline SVG markup. Takes precedence over `name`.
   *
   * Only pass trusted static SVG markup. Do not pass user-generated content.
   */
  readonly source = input<KuiIconSource | undefined>();

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

  private readonly iconSets = inject(KUI_ICONS, { optional: true }) ?? [];
  private readonly sanitizer = inject(DomSanitizer);

  private readonly resolvedIcon = resource({
    params: () => {
      const name = this.name();

      return name ? { name, iconSets: this.iconSets } : undefined;
    },
    loader: ({ params }) => this.resolveIcon(params.name, params.iconSets),
  });

  protected readonly svgSource = computed(() => this.source() ?? this.resolvedIcon.value());

  protected readonly trustedSvgSource = computed<SafeHtml | undefined>(() => {
    const svg = this.svgSource();

    return svg ? this.sanitizer.bypassSecurityTrustHtml(svg) : undefined;
  });

  protected readonly imageSource = computed(() => (this.svgSource() ? undefined : this.src()));

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
  ): Promise<KuiIconSource | undefined> {
    for (let index = iconSets.length - 1; index >= 0; index -= 1) {
      const iconSet = iconSets[index];
      const icon = typeof iconSet === 'function' ? await iconSet(name) : iconSet[name];

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
