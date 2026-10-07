import {
  KUI_ENGLISH_MESSAGES,
  type KuiMessageContext,
  type KuiMessagesLayer,
} from '@kikita-labs/ui';

import type { KuiCatalogueValue, KuiMessageCatalogue } from './interfaces';

type MessageParams = Readonly<Record<string, unknown>>;

/**
 * Turns the `kui` subtree of a translation catalogue into a Kikita UI message layer.
 *
 * Library messages that depend on values are functions; the catalogue keeps them as plain
 * templates (`"Page {page} of {total}"`) or as variants chosen by one parameter, so a translator
 * can keep working in JSON. This is the adapter pattern for any translator: Kikita UI takes
 * functions, the application decides how they are produced.
 */
export function createKuiMessagesLayer(
  catalogue: KuiMessageCatalogue | undefined,
): KuiMessagesLayer {
  const english = KUI_ENGLISH_MESSAGES as unknown as Record<string, Record<string, unknown>>;
  const layer: Record<string, Record<string, unknown>> = {};

  for (const [group, entries] of Object.entries(catalogue ?? {})) {
    const base = english[group];

    if (!base) {
      continue;
    }

    layer[group] = {};

    for (const [key, value] of Object.entries(entries)) {
      if (!(key in base)) {
        continue;
      }

      layer[group][key] = typeof base[key] === 'function' ? createMessage(value) : value;
    }
  }

  return layer as KuiMessagesLayer;
}

function createMessage(value: KuiCatalogueValue) {
  return (params: MessageParams, context: KuiMessageContext): string =>
    fillTemplate(selectTemplate(value, params, context), params, context);
}

function selectTemplate(
  value: KuiCatalogueValue,
  params: MessageParams,
  context: KuiMessageContext,
): string {
  if (typeof value === 'string') {
    return value;
  }

  const { $select, ...variants } = value;
  const selector = params[$select];

  if (typeof selector === 'number') {
    return context.plural(selector, { ...variants, other: variants['other'] ?? '' });
  }

  return variants[String(selector)] ?? variants['other'] ?? '';
}

function fillTemplate(template: string, params: MessageParams, context: KuiMessageContext): string {
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    const value = params[name];

    if (value === undefined) {
      return placeholder;
    }

    return typeof value === 'number' ? context.formatNumber(value) : String(value);
  });
}
