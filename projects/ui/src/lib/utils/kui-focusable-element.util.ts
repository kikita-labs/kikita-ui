/** An element that exposes the native imperative focus operation. */
export type KuiFocusableElement = Element & { focus: () => void };

/** Returns an element only when it can receive imperative focus. */
export function getFocusableElement(element: Element | null): KuiFocusableElement | null {
  if (!element || typeof (element as Partial<KuiFocusableElement>).focus !== 'function') {
    return null;
  }

  return element as KuiFocusableElement;
}
