import { MEDIA_VIEWER_PHOTO_HUES } from '@features/playground/pages/surfaces/media-viewer/constants';

/**
 * Builds a deterministic inline SVG data URI for the placeholder photo at a zero-based index.
 * The number is drawn into the picture, so it does not depend on the active language.
 */
export function mediaViewerPhotoSrc(index: number): string {
  const hue = MEDIA_VIEWER_PHOTO_HUES[index % MEDIA_VIEWER_PHOTO_HUES.length];
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">` +
    `<rect width="640" height="480" fill="hsl(${hue} 55% 42%)"/>` +
    `<circle cx="480" cy="140" r="64" fill="hsl(${hue} 70% 75%)"/>` +
    `<path d="M0 480V330l160-110 140 100 120-80 220 130v110z" fill="hsl(${hue} 45% 28%)"/>` +
    `<text x="320" y="270" font-family="sans-serif" font-size="96" fill="white" text-anchor="middle">${index + 1}</text>` +
    `</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
