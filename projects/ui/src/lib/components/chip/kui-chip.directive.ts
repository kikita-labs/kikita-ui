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

import { KUI_X_D } from '../../utils/kui-chrome-icon-paths.util';
import { injectKuiRootSizeDefault } from '../../utils/kui-defaults.util';
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
export class KuiChipDirective {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Visual chip treatment mapped to Kikita UI semantic tokens. */
  readonly appearance = input<KuiChipAppearance>('neutral');

  /** Chip size preset. Use `sm` inside Select and Combobox controls. */
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

  private readonly rootDefaultSize = injectKuiRootSizeDefault<KuiChipSize>();
  private readonly renderer = inject(Renderer2);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private removeButtonEl: HTMLButtonElement | null = null;

  protected readonly effectiveSize = computed(() => this.size() ?? this.rootDefaultSize ?? 'md');

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
        this.syncRemoveButtonState(this.disabled(), this.removeLabel());
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

    const svg = this.renderer.createElement('svg', 'svg');
    this.renderer.setAttribute(svg, 'viewBox', '0 0 24 24');
    this.renderer.setAttribute(svg, 'width', '10');
    this.renderer.setAttribute(svg, 'height', '10');
    this.renderer.setAttribute(svg, 'fill', 'none');
    this.renderer.setAttribute(svg, 'aria-hidden', 'true');

    for (const d of KUI_X_D) {
      const path = this.renderer.createElement('path', 'svg');
      this.renderer.setAttribute(path, 'd', d);
      this.renderer.setAttribute(path, 'stroke', 'currentColor');
      this.renderer.setAttribute(path, 'stroke-width', '2');
      this.renderer.setAttribute(path, 'stroke-linecap', 'round');
      this.renderer.appendChild(svg, path);
    }

    this.renderer.appendChild(button, svg);
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

  private syncRemoveButtonState(disabled: boolean, removeLabel: string | undefined): void {
    const button = this.removeButtonEl;

    if (!button) {
      return;
    }

    this.renderer.setAttribute(button, 'aria-label', removeLabel ?? 'Remove');

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
  }
}
