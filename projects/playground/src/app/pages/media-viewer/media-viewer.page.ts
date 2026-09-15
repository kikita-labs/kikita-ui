import { Component, signal, ViewEncapsulation } from '@angular/core';

import { KuiButtonDirective, KuiCheckboxDirective, kuiMediaViewer } from '@kikita-labs/ui';

import type { KuiMediaViewerItem } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

/**
 * Self-contained placeholder photos (inline SVG data URIs, no network dependency) so the page
 * behaves the same in SSR, Playwright, and an offline browser -- the same convention
 * `kui-avatar`'s docs demo uses (a deliberately unreachable `/missing-avatar.png`) rather than
 * pulling from an external image host.
 */
function placeholderPhoto(index: number, hue: number): KuiMediaViewerItem {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">
    <rect width="640" height="480" fill="hsl(${hue} 55% 45%)" />
    <text x="320" y="240" font-family="sans-serif" font-size="64" fill="white" text-anchor="middle" dominant-baseline="middle">${index + 1}</text>
  </svg>`;
  return {
    id: `demo-photo-${index}`,
    src: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    alt: `Placeholder photo ${index + 1}`,
  };
}

@Component({
  selector: 'app-media-viewer-page',
  imports: [KuiButtonDirective, KuiCheckboxDirective, PlaygroundPanelComponent],
  templateUrl: './media-viewer.page.html',
  styleUrl: './media-viewer.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class MediaViewerPage {
  private readonly openViewer = kuiMediaViewer();

  protected readonly photos: KuiMediaViewerItem[] = Array.from({ length: 6 }, (_, i) =>
    placeholderPhoto(i, i * 55),
  );

  protected readonly errorPhotos: KuiMediaViewerItem[] = [
    { id: 'broken', src: '/does-not-exist.jpg', alt: 'A photo that fails to load' },
  ];

  protected readonly selected = signal<ReadonlySet<string>>(new Set());
  protected readonly lastViewedIndex = signal<number | null>(null);

  protected openPhotoAt(index: number): void {
    this.openViewer({
      items: this.photos,
      index,
      onIndexChange: (i) => this.lastViewedIndex.set(i),
    });
  }

  protected openSinglePhoto(): void {
    this.openViewer({ items: [this.photos[0]] });
  }

  protected openErrorDemo(): void {
    this.openViewer({ items: this.errorPhotos });
  }

  protected openLimitedZoom(): void {
    this.openViewer({ items: this.photos, maxZoom: 1.5, zoomStep: 0.25 });
  }

  protected isSelected(id: string): boolean {
    return this.selected().has(id);
  }

  protected toggleSelected(id: string): void {
    this.selected.update((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }
}
