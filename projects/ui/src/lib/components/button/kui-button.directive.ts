import {
  Directive,
  ElementRef,
  Renderer2,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';

import { KuiSize } from '../../types';
import { KuiButtonAppearance } from './kui-button-appearance.type';
import { KuiButtonShape } from './kui-button-shape.type';

/** Applies Kikita UI button styling to native button and anchor elements. */
@Directive({
  selector: 'button[kuiButton], a[kuiButton]',
  host: {
    class: 'kui-button',
    '[attr.data-kui-shape]': 'shape()',
    '[attr.data-kui-appearance]': 'appearance()',
    '[attr.data-kui-size]': 'size()',
    '[attr.data-kui-wrap]': 'wrap() ? "" : null',
    '[attr.data-kui-loading]': 'loading() ? "" : null',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    '[attr.disabled]': 'nativeDisabledAttribute()',
    '[attr.tabindex]': 'isDisabled() ? "-1" : null',
    '(click)': 'handleClick($event)',
  },
})
export class KuiButtonDirective {
  /** Visual button surface shape. */
  readonly shape = input<KuiButtonShape>('solid');

  /** Optional semantic color intent; each shape provides its own default when omitted. */
  readonly appearance = input<KuiButtonAppearance | null>(null);

  /** Button size mapped to Kikita UI control height tokens. */
  readonly size = input<KuiSize>('md');

  /** Allows button text to wrap instead of truncating when the container is narrow. */
  readonly wrap = input(false, { transform: booleanAttribute });

  /** Disables the button host and removes anchor buttons from tab order. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Shows a spinner before the button content and blocks interaction while true. */
  readonly loading = input(false, { transform: booleanAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);

  private loaderEl: HTMLElement | null = null;

  protected readonly isDisabled = computed(() => this.disabled() || this.loading());

  protected readonly nativeDisabledAttribute = computed(() =>
    this.isDisabled() && this.host.tagName.toLowerCase() === 'button' ? '' : null,
  );

  constructor() {
    effect(() => {
      if (this.loading()) {
        this.showLoader(this.size());
      } else {
        this.hideLoader();
      }
    });
  }

  protected handleClick(event: Event): void {
    if (!this.isDisabled()) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
  }

  private showLoader(size: KuiSize): void {
    if (!this.loaderEl) {
      this.loaderEl = this.renderer.createElement('span');
      this.renderer.addClass(this.loaderEl, 'kui-loader');
      this.renderer.addClass(this.loaderEl, 'kui-button__loader');
      this.renderer.setAttribute(this.loaderEl, 'role', 'status');
      this.renderer.setAttribute(this.loaderEl, 'aria-live', 'polite');
      this.renderer.setAttribute(this.loaderEl, 'aria-label', 'Loading');
      this.renderer.insertBefore(this.host, this.loaderEl, this.host.firstChild);
    }

    this.renderer.setAttribute(this.loaderEl, 'data-kui-size', size);
  }

  private hideLoader(): void {
    if (!this.loaderEl) {
      return;
    }

    this.renderer.removeChild(this.host, this.loaderEl);
    this.loaderEl = null;
  }
}
