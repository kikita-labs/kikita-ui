import { isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  type ComponentRef,
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  PLATFORM_ID,
  Renderer2,
  ViewContainerRef,
} from '@angular/core';

import { KUI_BUTTON_OPTIONS } from '../../tokens/kui-button-options.token';
import type { KuiSize } from '../../types';
import { injectKuiRootSizeDefault } from '../../utils/kui-defaults.util';
import type { KuiButtonAppearance, KuiButtonShape } from '../button';
import { KuiIconComponent, type KuiIconName } from '../icon';

/** Applies square Kikita UI icon button styling to native button and anchor elements. */
@Directive({
  selector: 'button[kuiIconButton], a[kuiIconButton]',
  host: {
    class: 'kui-icon-button',
    '[attr.data-kui-shape]': 'effectiveShape()',
    '[attr.data-kui-appearance]': 'effectiveAppearance()',
    '[attr.data-kui-size]': 'effectiveSize()',
    '[attr.data-kui-loading]': 'loading() ? "" : null',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    '[attr.disabled]': 'nativeDisabledAttribute()',
    '[attr.tabindex]': 'isDisabled() ? "-1" : null',
    '(click)': 'handleClick($event)',
  },
})
export class KuiIconButtonDirective {
  /** Visual icon button surface shape. */
  readonly shape = input<KuiButtonShape | undefined>();

  /** Optional semantic color intent; each shape provides its own default when omitted. */
  readonly appearance = input<KuiButtonAppearance | null | undefined>();

  /** Icon button size mapped to Kikita UI control height tokens. */
  readonly size = input<KuiSize | undefined>();

  /** Disables the icon button host and removes anchor icon buttons from tab order. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Shows a spinner in place of the icon and blocks interaction while true. */
  readonly loading = input(false, { transform: booleanAttribute });

  /**
   * Renders the button's icon from a registered name instead of manually projecting a
   * `kui-icon`. Prepended before any other projected content.
   */
  readonly icon = input<KuiIconName | undefined>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly buttonOpts = inject(KUI_BUTTON_OPTIONS, { optional: true });
  private readonly rootDefaultSize = injectKuiRootSizeDefault();

  private iconRef: ComponentRef<KuiIconComponent> | null = null;
  private contentEl: HTMLElement | null = null;
  private loaderEl: HTMLElement | null = null;

  protected readonly isDisabled = computed(() => this.disabled() || this.loading());

  protected readonly nativeDisabledAttribute = computed(() =>
    this.isDisabled() && this.host.tagName.toLowerCase() === 'button' ? '' : null,
  );

  protected readonly effectiveShape = computed(
    () => this.shape() ?? this.buttonOpts?.iconButton?.shape ?? 'ghost',
  );

  protected readonly effectiveAppearance = computed(() => {
    const appearance = this.appearance();

    return appearance !== undefined
      ? appearance
      : (this.buttonOpts?.iconButton?.appearance ?? null);
  });

  protected readonly effectiveSize = computed(
    () => this.size() ?? this.buttonOpts?.iconButton?.size ?? this.rootDefaultSize ?? 'md',
  );

  constructor() {
    // See KuiButtonDirective for why this DOM mutation must not run during SSR.
    if (!this.isBrowser) {
      return;
    }

    effect(() => {
      this.iconRef = this.syncIcon(this.icon(), this.iconRef);
    });

    effect(() => {
      if (this.loading()) {
        this.showLoader(this.effectiveSize());
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
    this.ensureContentWrapper();

    if (!this.loaderEl) {
      this.loaderEl = this.renderer.createElement('span');
      this.renderer.addClass(this.loaderEl, 'kui-loader');
      this.renderer.addClass(this.loaderEl, 'kui-icon-button__loader');
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
    this.renderer.insertBefore(contentEl, created.location.nativeElement, contentEl.firstChild);

    return created;
  }

  private ensureContentWrapper(): void {
    if (this.contentEl) {
      return;
    }

    this.contentEl = this.renderer.createElement('span');
    this.renderer.addClass(this.contentEl, 'kui-icon-button__content');

    while (this.host.firstChild) {
      this.renderer.appendChild(this.contentEl, this.host.firstChild);
    }

    this.renderer.appendChild(this.host, this.contentEl);
  }
}
