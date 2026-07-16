/** Icon name used to resolve an SVG from the Kikita UI icon registry. */
export type KuiIconName = string;

/** Trusted static inline SVG markup used as an icon source. */
export type KuiIconSource = string;

/** Resolves an icon name to trusted inline SVG markup, or `undefined` if it has no match. */
export type KuiIconResolver = (name: KuiIconName) => Promise<KuiIconSource | undefined>;

/** Registry of icon names to inline SVG markup, or a resolver that looks them up lazily. */
export type KuiIconRegistry = Readonly<Record<KuiIconName, KuiIconSource>> | KuiIconResolver;
