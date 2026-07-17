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

import { KuiButtonAppearance, KuiButtonShape } from '../button';
import { KuiIconComponent, type KuiIconName } from '../icon';
import { KuiSize } from '../../types';

/** Applies square Kikita UI icon button styling to native button and anchor elements. */
@Directive({
  selector: 'button[kuiIconButton], a[kuiIconButton]',
  host: {
    class: 'kui-icon-button',
    '[attr.data-kui-shape]': 'shape()',
    '[attr.data-kui-appearance]': 'appearance()',
    '[attr.data-kui-size]': 'size()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.disabled]': 'nativeDisabledAttribute()',
    '[attr.tabindex]': 'disabled() ? "-1" : null',
    '(click)': 'handleClick($event)',
  },
})
export class KuiIconButtonDirective {
  /** Visual icon button surface shape. */
  readonly shape = input<KuiButtonShape>('ghost');

  /** Optional semantic color intent; each shape provides its own default when omitted. */
  readonly appearance = input<KuiButtonAppearance | null>(null);

  /** Icon button size mapped to Kikita UI control height tokens. */
  readonly size = input<KuiSize>('md');

  /** Disables the icon button host and removes anchor icon buttons from tab order. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Renders the button's icon from a registered name instead of manually projecting a
   * `kui-icon`. Prepended before any other projected content.
   */
  readonly icon = input<KuiIconName | undefined>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private iconRef: ComponentRef<KuiIconComponent> | null = null;

  protected readonly nativeDisabledAttribute = computed(() =>
    this.disabled() && this.host.tagName.toLowerCase() === 'button' ? '' : null,
  );

  constructor() {
    // See KuiButtonDirective for why this DOM mutation must not run during SSR.
    if (!this.isBrowser) {
      return;
    }

    effect(() => {
      this.iconRef = this.syncIcon(this.icon(), this.iconRef);
    });
  }

  protected handleClick(event: Event): void {
    if (!this.disabled()) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
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

    const created = this.viewContainerRef.createComponent(KuiIconComponent);
    created.setInput('name', name);
    this.renderer.insertBefore(this.host, created.location.nativeElement, this.host.firstChild);

    return created;
  }
}
