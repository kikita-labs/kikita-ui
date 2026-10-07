import type { Page } from '@playwright/test';

/** The `kui` subtree of a Playground catalogue: library messages as templates or variants. */
export type KuiCatalogue = Readonly<
  Record<string, Readonly<Record<string, string | Readonly<Record<string, string>>>>>
>;

/** Loads the library messages the Playground feeds to Kikita UI for a language. */
export async function loadKuiCatalogue(page: Page, language: 'en' | 'ru'): Promise<KuiCatalogue> {
  const response = await page.request.get(`/i18n/${language}.json`);

  if (!response.ok()) {
    throw new Error(`Could not load the ${language} catalogue: ${response.status()}`);
  }

  return ((await response.json()) as { kui: KuiCatalogue }).kui;
}

/**
 * One library message with its `{name}` placeholders filled. Variants are chosen by `$select`: a
 * boolean picks `true` or `false`, a number picks `one` for 1 and otherwise `other` (enough for the
 * counts the specs use).
 */
export function kuiMessage(
  catalogue: KuiCatalogue,
  group: string,
  key: string,
  params: Readonly<Record<string, string | number | boolean>> = {},
): string {
  const entry = catalogue[group]?.[key];

  if (entry === undefined) {
    throw new Error(`The catalogue has no kui.${group}.${key}`);
  }

  let template: string;

  if (typeof entry === 'string') {
    template = entry;
  } else {
    const selector = params[entry['$select']];
    const variant =
      typeof selector === 'number' ? (selector === 1 ? 'one' : 'other') : String(selector);
    template = entry[variant] ?? entry['other'];
  }

  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in params ? String(params[name]) : placeholder,
  );
}
