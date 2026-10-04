import { isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  output,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';

import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import { KuiDefaults } from '../../providers/kui-defaults.service';
import { injectKuiRootSizeDefault } from '../../providers/kui-defaults.util';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import { KUI_GLYPH_X } from '../icon/kui-chrome-glyphs';
import { createKuiGlyphElement } from '../icon/kui-glyph-dom.util';
import type { KuiIconGlyph } from '../icon/kui-icon-glyph.type';
import type { KuiChipAppearance } from './kui-chip-appearance.type';
import type { KuiChipSize } from './kui-chip-size.type';

/** Applies Kikita UI chip styling to selected values, filters, tags, and metadata. */
@Directive({
  selector: '[kuiChip]',
  host: {
    class: 'kui-chip',
    '[attr.data-kui-appearance]': 'appearance()',
    '[attr.data-kui-size]': 'effectiveSize()',
    '[class.kui-chip--disabled]': 'disabled()',
    '[class.kui-chip--invalid]': 'invalid()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.disabled]': 'disabledAttr()',
  },
})
export class KuiChip {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Visual chip treatment mapped to Kikita UI semantic tokens. */
  readonly appearance = input<KuiChipAppearance>('neutral');

  /** Chip size preset. Use `sm` inside Select and Combobox controls. Defaults to `defaults.chip.size`, then the global `defaults.size`, then md. */
  readonly size = input<KuiChipSize | undefined>();

  /** Marks the chip disabled and makes its remove action inert. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Applies invalid border treatment for context-specific invalid selected values. */
  readonly invalid = input(false, { transform: booleanAttribute });

  /**
   * Renders a default remove button (crossmark icon) as the chip's last child. This is the
   * primary way to make a chip removable; use a projected `button[kuiChipRemove]` instead only
   * when the default button isn't enough (custom icon, extra content). Do not combine both on
   * the same chip.
   */
  readonly removable = input(false, { transform: booleanAttribute });

  /**
   * Accessible name for the default remove button rendered by `removable`. Provide a
   * value-specific label, for example `"Remove Design"`, so screen reader users know which
   * chip a given remove button clears. Falls back to `"Remove"` when omitted.
   */
  readonly removeLabel = input<string | undefined>();

  /** Emitted when the default remove button or a nested `button[kuiChipRemove]` is activated. */
  readonly removed = output<void>();

  private readonly chipDefaults = inject(KuiDefaults).get('chip');
  private readonly common = injectKuiMessages('common');
  private readonly rootDefaultSize = injectKuiRootSizeDefault<KuiChipSize>();
  private readonly renderer = inject(Renderer2);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly removeGlyph = injectKuiGlyph({
    role: 'remove',
    slot: () => this.chipDefaults()?.removeIcon,
    fallback: KUI_GLYPH_X,
  });

  private removeButtonEl: HTMLButtonElement | null = null;
  private removeGlyphEl: SVGElement | null = null;
  private renderedGlyph: KuiIconGlyph | null = null;

  protected readonly effectiveSize = computed(
    () => this.size() ?? this.chipDefaults()?.size ?? this.rootDefaultSize() ?? 'md',
  );

  protected readonly disabledAttr = computed(() => {
    const tag = this.elementRef.nativeElement.tagName.toLowerCase();
    return this.disabled() && tag === 'button' ? '' : null;
  });

  constructor() {
    // Building the default remove button is a DOM mutation that would change the compiled
    // template shape before hydration, so it must not run on the server.
    if (!this.isBrowser) {
      return;
    }

    effect(() => {
      if (this.removable()) {
        this.ensureRemoveButton();
        this.syncRemoveGlyph(this.removeGlyph());
        this.syncRemoveButtonState(this.disabled(), this.removeLabel() ?? this.common().remove);
      } else {
        this.destroyRemoveButton();
      }
    });
  }

  /** @internal Emits the public remove event for a nested remove directive. */
  _emitRemoved(): void {
    if (!this.disabled()) {
      this.removed.emit();
    }
  }

  private ensureRemoveButton(): void {
    if (this.removeButtonEl) {
      return;
    }

    const button = this.renderer.createElement('button') as HTMLButtonElement;
    this.renderer.addClass(button, 'kui-chip-remove');
    this.renderer.setAttribute(button, 'type', 'button');

    this.renderer.listen(button, 'click', (event: MouseEvent) => {
      event.stopPropagation();

      if (this.disabled()) {
        event.preventDefault();
        return;
      }

      this._emitRemoved();
    });
    this.renderer.appendChild(this.elementRef.nativeElement, button);
    this.removeButtonEl = button;
  }

  /** Draws the resolved glyph into the remove button, replacing the previous one. */
  private syncRemoveGlyph(glyph: KuiIconGlyph): void {
    const button = this.removeButtonEl;

    if (!button || (this.removeGlyphEl && this.renderedGlyph === glyph)) {
      return;
    }

    if (this.removeGlyphEl) {
      this.renderer.removeChild(button, this.removeGlyphEl);
    }

    this.removeGlyphEl = createKuiGlyphElement(this.renderer, glyph, { size: 10, strokeWidth: 2 });
    this.renderedGlyph = glyph;
    this.renderer.appendChild(button, this.removeGlyphEl);
  }

  private syncRemoveButtonState(disabled: boolean, removeLabel: string): void {
    const button = this.removeButtonEl;

    if (!button) {
      return;
    }

    this.renderer.setAttribute(button, 'aria-label', removeLabel);

    if (disabled) {
      this.renderer.setAttribute(button, 'aria-disabled', 'true');
      this.renderer.setAttribute(button, 'tabindex', '-1');
      this.renderer.setAttribute(button, 'disabled', '');
    } else {
      this.renderer.removeAttribute(button, 'aria-disabled');
      this.renderer.removeAttribute(button, 'tabindex');
      this.renderer.removeAttribute(button, 'disabled');
    }
  }

  private destroyRemoveButton(): void {
    if (!this.removeButtonEl) {
      return;
    }

    this.renderer.removeChild(this.elementRef.nativeElement, this.removeButtonEl);
    this.removeButtonEl = null;
    this.removeGlyphEl = null;
    this.renderedGlyph = null;
  }
}
