/** Value of one attribute on a glyph element. Only a fixed set of attribute names is ever rendered. */
export type KuiIconGlyphAttributes = Readonly<Record<string, string | number | undefined>>;

/**
 * One drawable element of a glyph: `[tag, attributes, children?]`.
 *
 * The layout matches the icon-node format of Lucide, so data from `@lucide/icons` can be used as is.
 * Only `path`, `line`, `polyline`, `polygon`, `circle`, `ellipse` and `rect` are drawn; `children`
 * are never rendered.
 */
export type KuiIconGlyphNode = readonly [
  tag: string,
  attributes: KuiIconGlyphAttributes,
  children?: readonly KuiIconGlyphNode[],
];

/**
 * Icon data for the structural icons of Kikita UI (close, chevrons, status marks, ...).
 *
 * A glyph is plain data, not markup: it is drawn through a fixed allowlist of SVG elements and
 * attributes, never through `innerHTML`, so it is safe to build from any source and renders
 * synchronously, including on the server. Unknown elements make the whole glyph invalid; unknown
 * attributes (event handlers, `style`, `href`, `class`, ...) are ignored. An invalid glyph is
 * ignored and the next level of the precedence chain is used.
 *
 * Use stroke-based drawings on a 24 by 24 grid so the glyph follows `currentColor` and the
 * `--kui-icon-stroke-width` token. Other grids are supported through `viewBox`.
 */
export interface KuiIconGlyph {
  /** Elements to draw, in paint order. */
  readonly node: readonly KuiIconGlyphNode[];

  /** SVG `viewBox`, four numbers. Defaults to `0 0 24 24`. */
  readonly viewBox?: string;
}
