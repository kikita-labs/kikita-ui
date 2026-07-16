import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
} from '@angular/core';

import { KUI_CHEVRON_RIGHT_D } from '../../utils/kui-chrome-icon-paths.util';
import { KUI_ACCORDION_CONTEXT } from './kui-accordion-context.token';
import { KuiAccordionIconDirective } from './kui-accordion-icon.directive';

let _nextId = 0;

/**
 * A single expandable section inside `kui-accordion`.
 * The trigger button is rendered internally; body content is projected via `ng-content`.
 *
 * @example
 * ```html
 * <kui-accordion-item header="General settings">
 *   Configure display and behavior options.
 * </kui-accordion-item>
 * ```
 */
@Component({
  selector: 'kui-accordion-item',
  imports: [NgTemplateOutlet],
  template: `
    <button
      class="kui-accordion-trigger"
      type="button"
      [id]="triggerId()"
      [attr.aria-expanded]="isOpen()"
      [attr.aria-controls]="bodyId()"
      [attr.aria-disabled]="disabled() || null"
      [attr.tabindex]="disabled() ? -1 : null"
      (click)="onTriggerClick()"
    >
      @if (iconTplRef(); as tpl) {
        <span class="kui-accordion-icon">
          <ng-container [ngTemplateOutlet]="tpl" />
        </span>
      }
      <span class="kui-accordion-trigger-text">{{ header() }}</span>
      <span class="kui-accordion-chevron" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="${KUI_CHEVRON_RIGHT_D}"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </button>
    <div
      class="kui-accordion-body-wrap"
      [class.is-open]="isOpen()"
      [id]="bodyId()"
      role="region"
      [attr.aria-labelledby]="triggerId()"
      [attr.aria-hidden]="isOpen() ? null : 'true'"
      [attr.inert]="isOpen() ? null : ''"
    >
      <div class="kui-accordion-body-inner">
        <div class="kui-accordion-body-content">
          <ng-content />
        </div>
      </div>
    </div>
  `,
  host: { class: 'kui-accordion-item' },
  encapsulation: ViewEncapsulation.None,
})
export class KuiAccordionItemComponent {
  /** Label text rendered inside the trigger button. */
  readonly header = input<string>('');

  /**
   * Unique ID used for aria-controls / aria-labelledby wiring.
   * Auto-generated when not provided.
   */
  readonly id = input<string>('');

  /** Disables the trigger: aria-disabled="true", removed from tab order. */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly ctx = inject(KUI_ACCORDION_CONTEXT);

  /** TemplateRef from a nested `ng-template[kuiAccordionIcon]`. */
  protected readonly iconTplRef = contentChild(KuiAccordionIconDirective, { read: TemplateRef });

  private readonly _autoId = `kui-accordion-item-${_nextId++}`;
  protected readonly itemId = computed(() => this.id() || this._autoId);
  protected readonly triggerId = computed(() => `${this.itemId()}-trigger`);
  protected readonly bodyId = computed(() => `${this.itemId()}-body`);
  protected readonly isOpen = computed(() => this.ctx.expandedItems().includes(this.itemId()));

  protected onTriggerClick(): void {
    if (this.disabled()) return;
    this.ctx.toggle(this.itemId());
  }
}
