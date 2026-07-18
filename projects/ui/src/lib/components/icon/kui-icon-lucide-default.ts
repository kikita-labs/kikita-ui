import type { KuiIconResolver } from './kui-icon-source.type';

/**
 * Major version of `lucide-static` served from the CDN. Pinned to a major so new icons and
 * patches show up automatically without risking a breaking change from a future major bump.
 * See https://www.jsdelivr.com/documentation for jsDelivr's npm version syntax.
 */
const LUCIDE_STATIC_MAJOR_VERSION = 1;

const lucideIconCache = new Map<string, Promise<string | undefined>>();

async function loadLucideIcon(name: string): Promise<string | undefined> {
  try {
    const response = await fetch(
      `https://cdn.jsdelivr.net/npm/lucide-static@${LUCIDE_STATIC_MAJOR_VERSION}/icons/${name}.svg`,
    );

    return response.ok ? await response.text() : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Default Kikita UI icon resolver: lazily fetches inline SVG markup for a Lucide icon name from
 * the jsDelivr CDN and caches it in memory for the lifetime of the app, shared across every
 * `kui-icon` that requests it.
 *
 * Does not require installing any Lucide package -- only a network request to jsDelivr.
 */
export const resolveLucideIcon: KuiIconResolver = (name) => {
  let pending = lucideIconCache.get(name);

  if (!pending) {
    pending = loadLucideIcon(name);
    lucideIconCache.set(name, pending);
  }

  return pending;
};
