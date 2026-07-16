import { Component, ViewEncapsulation } from '@angular/core';

import { KUI_CHEVRON_RIGHT_D } from '../../utils/kui-chrome-icon-paths.util';

/**
 * Decorative chevron separator between crumbs inside a `[kuiBreadcrumbs]` trail.
 * Renders as `aria-hidden` and is never read by assistive technology.
 *
 * @example
 * ```html
 * <li><a kuiBreadcrumbItem href="/components">Components</a></li>
 * <li kuiBreadcrumbSeparator></li>
 * <li><span kuiBreadcrumbItem current>Icon Button</span></li>
 * ```
 */
@Component({
  selector: 'li[kuiBreadcrumbSeparator]',
  template: `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="${KUI_CHEVRON_RIGHT_D}"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `,
  host: {
    class: 'kui-breadcrumb-sep',
    'aria-hidden': 'true',
  },
  encapsulation: ViewEncapsulation.None,
})
export class KuiBreadcrumbSeparatorComponent {}
