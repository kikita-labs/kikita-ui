/**
 * Variants of one message chosen by a parameter. `$select` names the parameter: a number picks the
 * plural category (`zero`, `one`, `two`, `few`, `many`, `other`) and a boolean picks `true` or `false`.
 */
export interface KuiCatalogueVariants {
  readonly $select: string;
  readonly [variant: string]: string;
}

/** One catalogue entry: a template with `{name}` placeholders, or variants chosen by a parameter. */
export type KuiCatalogueValue = string | KuiCatalogueVariants;

/** The `kui` subtree of a Playground translation catalogue: group, then message key. */
export type KuiMessageCatalogue = Readonly<
  Record<string, Readonly<Record<string, KuiCatalogueValue>>>
>;
