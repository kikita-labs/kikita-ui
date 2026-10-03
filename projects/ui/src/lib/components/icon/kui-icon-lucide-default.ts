import type { KuiIconGlyph } from './kui-icon-glyph.type';
import type { KuiIconResolver } from './kui-icon-source.type';
import { parseKuiSvgToGlyph } from './kui-icon-svg-parse.util';

/**
 * Exact `lucide-static` version the default resolver reads. It changes only with a Kikita UI release,
 * so a given library version always draws the same icons and a new upstream release cannot alter
 * them silently. Use {@link createKuiLucideResolver} to read another version or origin.
 */
export const KUI_LUCIDE_STATIC_VERSION = '1.51.0';

const LUCIDE_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Options of {@link createKuiLucideResolver}. */
export interface KuiLucideResolverOptions {
  /** `lucide-static` version to read. Defaults to {@link KUI_LUCIDE_STATIC_VERSION}. */
  readonly version?: string;

  /**
   * Base URL of the icon files, without a trailing slash. Defaults to
   * `https://cdn.jsdelivr.net/npm/lucide-static@<version>/icons`. Point it at your own origin to keep
   * icon requests off third-party hosts.
   */
  readonly baseUrl?: string;
}

/**
 * Creates a resolver that fetches Lucide icon SVGs by name and caches them in memory, shared by every
 * `kui-icon` that asks for the same name.
 *
 * The fetched text is never inserted as markup: it is converted to {@link KuiIconGlyph} data with an
 * element and attribute allowlist, so a compromised or replaced file cannot inject script or
 * references. Names must be Lucide kebab-case names; anything else resolves to `undefined` without a
 * request. Icons that use elements outside the allowlist (none of the Lucide set does) are skipped.
 */
export function createKuiLucideResolver(options: KuiLucideResolverOptions = {}): KuiIconResolver {
  const baseUrl =
    options.baseUrl ??
    `https://cdn.jsdelivr.net/npm/lucide-static@${options.version ?? KUI_LUCIDE_STATIC_VERSION}/icons`;
  const cache = new Map<string, Promise<KuiIconGlyph | undefined>>();

  async function load(name: string): Promise<KuiIconGlyph | undefined> {
    try {
      const response = await fetch(`${baseUrl}/${name}.svg`);

      return response.ok ? parseKuiSvgToGlyph(await response.text()) : undefined;
    } catch {
      return undefined;
    }
  }

  return (name) => {
    if (!LUCIDE_NAME_PATTERN.test(name)) {
      return Promise.resolve(undefined);
    }

    let pending = cache.get(name);

    if (!pending) {
      pending = load(name);
      cache.set(name, pending);
    }

    return pending;
  };
}

/**
 * Default Kikita UI icon resolver: lazily fetches a Lucide icon by name from the jsDelivr CDN, at the
 * pinned {@link KUI_LUCIDE_STATIC_VERSION}, and draws it from allowlisted data.
 *
 * Does not require installing any Lucide package -- only a network request to jsDelivr. Opt out with
 * `provideKikitaUi({ icons: false })`.
 */
export const resolveLucideIcon: KuiIconResolver = createKuiLucideResolver();
