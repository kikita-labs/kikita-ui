/** Icon name used to resolve an SVG from the Kikita UI icon registry. */
export type KuiIconName = string;

/** Trusted static inline SVG markup used as an icon source. */
export type KuiIconSource = string;

/** Registry of icon names to inline SVG markup. */
export type KuiIconRegistry = Readonly<Record<KuiIconName, KuiIconSource>>;
