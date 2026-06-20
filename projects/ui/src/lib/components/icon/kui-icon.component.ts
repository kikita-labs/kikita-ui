import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { KUI_ICONS } from './kui-icon-registry.token';
import { KuiIconName, KuiIconSource } from './kui-icon-source.type';

/** Renders a registered inline SVG icon, direct inline SVG source, or external image URL. */
@Component({
  selector: 'kui-icon',
  templateUrl: './kui-icon.component.html',
  styleUrl: './kui-icon.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  /** CSS size for the icon box. */
  readonly size = input<string | number>('1em');

  private readonly iconSets = inject(KUI_ICONS, { optional: true }) ?? [];
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly svgSource = computed(() => this.source() ?? this.resolveIcon(this.name()));

  protected readonly trustedSvgSource = computed<SafeHtml | undefined>(() => {
    const svg = this.svgSource();

    return svg ? this.sanitizer.bypassSecurityTrustHtml(svg) : undefined;
  });

  protected readonly imageSource = computed(() => (this.svgSource() ? undefined : this.src()));

  protected readonly iconSize = computed(() => {
    const size = this.size();

    return typeof size === 'number' ? `${size}px` : size;
  });

  private resolveIcon(name: KuiIconName | undefined): KuiIconSource | undefined {
    if (!name) {
      return undefined;
    }

    for (let index = this.iconSets.length - 1; index >= 0; index -= 1) {
      const icon = this.iconSets[index][name];

      if (icon) {
        return icon;
      }
    }

    return undefined;
  }
}
