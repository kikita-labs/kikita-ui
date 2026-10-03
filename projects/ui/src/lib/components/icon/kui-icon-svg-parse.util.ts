import type { KuiIconGlyph, KuiIconGlyphNode } from './kui-icon-glyph.type';
import { inspectKuiIconGlyph } from './kui-icon-glyph.util';

const MAX_MARKUP_LENGTH = 65_536;
const ROOT_PATTERN = /<svg\b([^<>]*)>/i;
const TAG_PATTERN = /<(\/?)([A-Za-z][\w:-]*)([^<>]*?)(\/?)>/g;
const ATTRIBUTE_PATTERN = /([A-Za-z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

/**
 * Converts the markup of a simple stroke icon (such as a Lucide file) into safe {@link KuiIconGlyph}
 * data, or returns `undefined` when the markup is anything else.
 *
 * Nothing is trusted: the text is scanned without a DOM (so it works on the server), only the
 * elements and attributes of the glyph allowlist survive, and any other element, text, `<script>`
 * or markup that does not parse makes the whole icon invalid. The result is drawn through the same
 * renderer as the built-in glyphs, never through `innerHTML`.
 */
export function parseKuiSvgToGlyph(markup: string): KuiIconGlyph | undefined {
  if (markup.length > MAX_MARKUP_LENGTH) {
    return undefined;
  }

  const text = markup.replace(/<!--[\s\S]*?-->/g, '');
  const root = ROOT_PATTERN.exec(text);
  const end = text.lastIndexOf('</svg>');

  if (!root || end < root.index + root[0].length) {
    return undefined;
  }

  const body = text.slice(root.index + root[0].length, end);
  const nodes: KuiIconGlyphNode[] = [];

  for (const match of body.matchAll(TAG_PATTERN)) {
    const [, closing, tag, attributes] = match;

    if (closing) {
      continue;
    }

    nodes.push([tag, readAttributes(attributes)]);
  }

  // Anything between the tags other than whitespace (text, CDATA, a stray `<`) is not an icon.
  if (body.replace(TAG_PATTERN, '').trim() !== '') {
    return undefined;
  }

  const viewBox = readAttributes(root[1])['viewBox'];
  const glyph = inspectKuiIconGlyph(
    viewBox === undefined ? { node: nodes } : { node: nodes, viewBox },
  ).glyph;

  // Rebuild from the validated form so the result carries no attribute that was dropped.
  return glyph
    ? { viewBox: glyph.viewBox, node: glyph.nodes.map((node) => [node.tag, node.attrs] as const) }
    : undefined;
}

function readAttributes(source: string): Record<string, string> {
  const attributes: Record<string, string> = {};

  for (const match of source.matchAll(ATTRIBUTE_PATTERN)) {
    attributes[match[1]] = match[2] ?? match[3] ?? '';
  }

  return attributes;
}
