import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  inject,
  input,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';

import { KuiDefaults } from '../../providers/kui-defaults.service';
import { kuiNextId } from '../../utils/kui-id.util';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import { KUI_GLYPH_CHEVRON_RIGHT } from '../icon/kui-chrome-glyphs';
import { KuiGlyphComponent } from '../icon/kui-glyph.component';
import { KUI_ACCORDION_CONTEXT } from './kui-accordion-context.token';
import { KuiAccordionIconDirective } from './kui-accordion-icon.directive';

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
  imports: [NgTemplateOutlet, KuiGlyphComponent],
  templateUrl: './kui-accordion-item.component.html',
  host: { class: 'kui-accordion-item' },
  encapsulation: ViewEncapsulation.None,
})
/** Represents a single expandable item inside a Kikita UI accordion. */
export class KuiAccordionItemComponent {
  private readonly accordionDefaults = inject(KuiDefaults).get('accordion');

  protected readonly disclosureGlyph = injectKuiGlyph({
    role: 'disclosure',
    slot: () => this.accordionDefaults()?.disclosureIcon,
    fallback: KUI_GLYPH_CHEVRON_RIGHT,
  });

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

  private readonly _autoId = kuiNextId('kui-accordion-item');
  protected readonly itemId = computed(() => this.id() || this._autoId);
  protected readonly triggerId = computed(() => `${this.itemId()}-trigger`);
  protected readonly bodyId = computed(() => `${this.itemId()}-body`);
  protected readonly isOpen = computed(() => this.ctx.expandedItems().includes(this.itemId()));

  protected onTriggerClick(): void {
    if (this.disabled()) return;
    this.ctx.toggle(this.itemId());
  }
}
