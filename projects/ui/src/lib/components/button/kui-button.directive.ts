import { isPlatformBrowser } from '@angular/common';
import {
  type ComponentRef,
  Directive,
  ElementRef,
  PLATFORM_ID,
  Renderer2,
  ViewContainerRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';

import { KuiIconComponent, type KuiIconName } from '../icon';
import { KuiSize } from '../../types';
import { KUI_BUTTON_OPTIONS } from '../../tokens/kui-button-options.token';
import { injectKuiRootSizeDefault } from '../../utils/kui-defaults.util';
import { KuiButtonAppearance } from './kui-button-appearance.type';
import { KuiButtonShape } from './kui-button-shape.type';

/** Applies Kikita UI button styling to native button and anchor elements. */
@Directive({
  selector: 'button[kuiButton], a[kuiButton]',
  host: {
    class: 'kui-button',
    '[attr.data-kui-shape]': 'effectiveShape()',
    '[attr.data-kui-appearance]': 'effectiveAppearance()',
    '[attr.data-kui-size]': 'effectiveSize()',
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
  readonly shape = input<KuiButtonShape | undefined>();

  /** Optional semantic color intent; each shape provides its own default when omitted. */
  readonly appearance = input<KuiButtonAppearance | null | undefined>();

  /** Button size mapped to Kikita UI control height tokens. */
  readonly size = input<KuiSize | undefined>();

  /** Allows button text to wrap instead of truncating when the container is narrow. */
  readonly wrap = input(false, { transform: booleanAttribute });

  /** Disables the button host and removes anchor buttons from tab order. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Shows a spinner before the button content and blocks interaction while true. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Decorative icon rendered before the button's projected content. */
  readonly iconStart = input<KuiIconName | undefined>();

  /** Decorative icon rendered after the button's projected content. */
  readonly iconEnd = input<KuiIconName | undefined>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly buttonOpts = inject(KUI_BUTTON_OPTIONS, { optional: true });
  private readonly rootDefaultSize = injectKuiRootSizeDefault();

  private contentEl: HTMLElement | null = null;
  private loaderEl: HTMLElement | null = null;
  private iconStartRef: ComponentRef<KuiIconComponent> | null = null;
  private iconEndRef: ComponentRef<KuiIconComponent> | null = null;

  protected readonly isDisabled = computed(() => this.disabled() || this.loading());

  protected readonly effectiveShape = computed(
    () => this.shape() ?? this.buttonOpts?.button?.shape ?? 'solid',
  );

  protected readonly effectiveAppearance = computed(() => {
    const appearance = this.appearance();

    return appearance !== undefined ? appearance : (this.buttonOpts?.button?.appearance ?? null);
  });

  protected readonly effectiveSize = computed(
    () => this.size() ?? this.buttonOpts?.button?.size ?? this.rootDefaultSize ?? 'md',
  );

  protected readonly nativeDisabledAttribute = computed(() =>
    this.isDisabled() && this.host.tagName.toLowerCase() === 'button' ? '' : null,
  );

  constructor() {
    /**
     * Angular's hydration reconciliation matches server DOM against the compiled template, not
     * against whatever this directive mutates at runtime. Running these Renderer2 mutations
     * during SSR (for statically-true inputs like iconStart/iconEnd, unlike loading, which is
     * rarely true on first render) ships wrapped markup the client's hydration pass doesn't
     * expect, crashing it. Skip entirely on the server; the client wraps/inserts after hydration.
     */
    if (!this.isBrowser) {
      return;
    }

    effect(() => {
      if (this.loading()) {
        this.showLoader(this.effectiveSize());
      } else {
        this.hideLoader();
      }
    });

    effect(() => {
      this.iconStartRef = this.syncIcon('start', this.iconStart(), this.iconStartRef);
    });

    effect(() => {
      this.iconEndRef = this.syncIcon('end', this.iconEnd(), this.iconEndRef);
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
    this.ensureContentWrapper();

    if (!this.loaderEl) {
      this.loaderEl = this.renderer.createElement('span');
      this.renderer.addClass(this.loaderEl, 'kui-loader');
      this.renderer.addClass(this.loaderEl, 'kui-button__loader');
      this.renderer.setAttribute(this.loaderEl, 'role', 'status');
      this.renderer.setAttribute(this.loaderEl, 'aria-live', 'polite');
      this.renderer.setAttribute(this.loaderEl, 'aria-label', 'Loading');
      this.renderer.appendChild(this.host, this.loaderEl);
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

  private syncIcon(
    position: 'start' | 'end',
    name: KuiIconName | undefined,
    existing: ComponentRef<KuiIconComponent> | null,
  ): ComponentRef<KuiIconComponent> | null {
    if (!name) {
      existing?.destroy();
      return null;
    }

    if (existing) {
      existing.setInput('name', name);
      return existing;
    }

    this.ensureContentWrapper();

    const contentEl = this.contentEl!;
    const created = this.viewContainerRef.createComponent(KuiIconComponent);
    created.setInput('name', name);
    this.renderer.addClass(created.location.nativeElement, `kui-button__icon-${position}`);

    if (position === 'start') {
      this.renderer.insertBefore(contentEl, created.location.nativeElement, contentEl.firstChild);
    } else {
      this.renderer.appendChild(contentEl, created.location.nativeElement);
    }

    return created;
  }

  private ensureContentWrapper(): void {
    if (this.contentEl) {
      return;
    }

    this.contentEl = this.renderer.createElement('span');
    this.renderer.addClass(this.contentEl, 'kui-button__content');

    while (this.host.firstChild) {
      this.renderer.appendChild(this.contentEl, this.host.firstChild);
    }

    this.renderer.appendChild(this.host, this.contentEl);
  }
}
