import { isDevMode } from '@angular/core';

import type { KuiIconGlyph } from './kui-icon-glyph.type';

/** Default `viewBox` of a glyph: the 24 by 24 grid used by Lucide and by the built-in glyphs. */
export const KUI_GLYPH_DEFAULT_VIEW_BOX = '0 0 24 24';

/** Elements a glyph may draw. Anything else makes the whole glyph invalid. */
const GLYPH_TAGS: ReadonlySet<string> = /* @__PURE__ */ new Set([
  'path',
  'line',
  'polyline',
  'polygon',
  'circle',
  'ellipse',
  'rect',
]);

/**
 * Attributes a glyph may set. Everything not listed (event handlers, `style`, `class`, `href`,
 * `id`, ...) is dropped, so a glyph can never inject behaviour or reference another resource.
 * `stroke-width` and `vector-effect` are deliberately absent: the renderer owns line weight so the
 * `--kui-icon-stroke-width` and `--kui-icon-vector-effect` tokens always apply.
 */
const GLYPH_ATTRIBUTES: ReadonlySet<string> = /* @__PURE__ */ new Set([
  'd',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'x',
  'y',
  'x1',
  'y1',
  'x2',
  'y2',
  'width',
  'height',
  'points',
  'fill',
  'fill-opacity',
  'fill-rule',
  'clip-rule',
  'stroke',
  'stroke-opacity',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-dasharray',
  'stroke-dashoffset',
  'opacity',
  'transform',
]);

const MAX_ATTRIBUTE_LENGTH = 8192;
const VIEW_BOX_PATTERN = /^\s*-?\d+(\.\d+)?([\s,]+-?\d+(\.\d+)?){3}\s*$/;

/** One element of a validated glyph: a known tag and string attributes from the allowlist. */
export interface KuiSanitizedGlyphNode {
  readonly tag: string;
  readonly attrs: Readonly<Record<string, string>>;
}

/** A glyph that passed validation and is ready to render. */
export interface KuiSanitizedGlyph {
  readonly viewBox: string;
  readonly nodes: readonly KuiSanitizedGlyphNode[];
}

/** Result of {@link inspectKuiIconGlyph}: a validated glyph or the reason it was rejected. */
export type KuiGlyphInspection =
  | { readonly glyph: KuiSanitizedGlyph; readonly reason?: undefined }
  | { readonly glyph?: undefined; readonly reason: string };

const inspections = /* @__PURE__ */ new WeakMap<object, KuiGlyphInspection>();
const warned = /* @__PURE__ */ new WeakSet<object>();

/**
 * Validates glyph data against the element and attribute allowlists.
 *
 * Pure and cached per glyph object, so calling it on every change detection pass is cheap. It
 * never throws: unusable input yields a `reason`.
 */
export function inspectKuiIconGlyph(glyph: unknown): KuiGlyphInspection {
  if (typeof glyph !== 'object' || glyph === null) {
    return { reason: 'the value is not an object' };
  }

  const cached = inspections.get(glyph);

  if (cached) {
    return cached;
  }

  const inspection = inspect(glyph as Partial<KuiIconGlyph>);

  inspections.set(glyph, inspection);

  return inspection;
}

/**
 * Returns the first valid glyph of the candidates, or the fallback.
 *
 * A candidate that is present but invalid is reported once in development mode, so a typo in an
 * override is visible instead of silently showing the built-in glyph.
 */
export function pickKuiGlyph(
  candidates: readonly (KuiIconGlyph | undefined)[],
  fallback: KuiIconGlyph,
): KuiIconGlyph {
  for (const candidate of candidates) {
    if (candidate === undefined) {
      continue;
    }

    const inspection = inspectKuiIconGlyph(candidate);

    if (inspection.glyph) {
      return candidate;
    }

    reportInvalidGlyph(candidate, inspection.reason);
  }

  return fallback;
}

function reportInvalidGlyph(candidate: unknown, reason: string): void {
  if (!isDevMode() || typeof candidate !== 'object' || candidate === null) {
    return;
  }

  if (warned.has(candidate)) {
    return;
  }

  warned.add(candidate);
  console.warn(`[kikita-ui] Ignoring an invalid icon glyph: ${reason}.`);
}

function inspect(glyph: Partial<KuiIconGlyph>): KuiGlyphInspection {
  const { node, viewBox } = glyph;

  if (!Array.isArray(node) || node.length === 0) {
    return { reason: '`node` must be a non-empty array' };
  }

  if (viewBox !== undefined && (typeof viewBox !== 'string' || !VIEW_BOX_PATTERN.test(viewBox))) {
    return { reason: '`viewBox` must be four numbers' };
  }

  const nodes: KuiSanitizedGlyphNode[] = [];

  for (const entry of node as readonly unknown[]) {
    if (!Array.isArray(entry)) {
      return { reason: 'every node must be a `[tag, attributes]` tuple' };
    }

    const [tag, attributes] = entry as [unknown, unknown];

    if (typeof tag !== 'string' || !GLYPH_TAGS.has(tag)) {
      return { reason: `element \`${String(tag)}\` is not supported` };
    }

    if (typeof attributes !== 'object' || attributes === null) {
      return { reason: `element \`${tag}\` has no attributes object` };
    }

    nodes.push({ tag, attrs: sanitizeAttributes(attributes as Record<string, unknown>) });
  }

  return {
    glyph: { viewBox: (viewBox ?? KUI_GLYPH_DEFAULT_VIEW_BOX).trim(), nodes },
  };
}

function sanitizeAttributes(attributes: Record<string, unknown>): Record<string, string> {
  const attrs: Record<string, string> = {};

  for (const [name, value] of Object.entries(attributes)) {
    if (!GLYPH_ATTRIBUTES.has(name)) {
      continue;
    }

    if (typeof value !== 'string' && typeof value !== 'number') {
      continue;
    }

    const text = String(value);

    if (text.length > MAX_ATTRIBUTE_LENGTH || /url\s*\(|[<>]|javascript:/i.test(text)) {
      continue;
    }

    attrs[name] = text;
  }

  return attrs;
}
