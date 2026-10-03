import type { KuiIconGlyph } from './kui-icon-glyph.type';

/** Icon name used to resolve an SVG from the Kikita UI icon registry. */
export type KuiIconName = string;

/** Trusted static inline SVG markup used as an icon source. */
export type KuiIconSource = string;

/**
 * Anything `kui-icon` can draw from a name or a `source`: trusted SVG markup, or {@link KuiIconGlyph}
 * data.
 *
 * Markup is inserted as trusted HTML, so it must be static application code. Glyph data is drawn
 * through an allowlist of SVG elements and attributes, so it is safe from any source, and it renders
 * synchronously, including on the server.
 */
export type KuiIconContent = KuiIconSource | KuiIconGlyph;

/** Resolves an icon name to icon content, or `undefined` if it has no match. */
export type KuiIconResolver = (name: KuiIconName) => Promise<KuiIconContent | undefined>;

/** Registry of icon names to icon content, or a resolver that looks them up lazily. */
export type KuiIconRegistry = Readonly<Record<KuiIconName, KuiIconContent>> | KuiIconResolver;
